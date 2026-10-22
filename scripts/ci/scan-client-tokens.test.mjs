import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import {
  formatReport,
  scanBundles,
  scanContents,
  tokenValuesFromEnv,
} from './scan-client-tokens.mjs';

const root = fileURLToPath(new URL('../../', import.meta.url));
const read = (path) => readFileSync(join(root, path), 'utf8');
const sanityToken = `sk${'a'.repeat(100)}`;
const almostToken = `sk${'a'.repeat(99)}`;
const viewerToken = 'viewer-token-value-not-real';

function fixture() {
  const cwd = mkdtempSync(join(tmpdir(), 'client-tokens-'));
  mkdirSync(join(cwd, '.next/static/chunks'), { recursive: true });
  return cwd;
}

test('flags a Sanity token pattern of sk plus 100 characters and ignores a shorter lookalike', () => {
  assert.deepEqual(scanContents(`const leaked = "${sanityToken}";`, []), [
    { kind: 'sanity-pattern' },
  ]);
  assert.deepEqual(scanContents(`const fine = "${almostToken}";`, []), []);
});

test('flags an environment value whose name ends in TOKEN and ignores other secrets', () => {
  const tokens = tokenValuesFromEnv({
    SANITY_API_READ_TOKEN: viewerToken,
    MEDAL_API_KEY: 'medal-key-should-not-match-by-name',
    EMPTY_TOKEN: '',
    SHORT_TOKEN: 'short',
  });

  assert.deepEqual(
    tokens.map((entry) => entry.name),
    ['SANITY_API_READ_TOKEN']
  );
  const hits = scanContents(`window.TOKEN = "${viewerToken}";`, tokens);
  assert.deepEqual(hits, [{ kind: 'env-token', name: 'SANITY_API_READ_TOKEN' }]);
  assert.equal(JSON.stringify(hits).includes(viewerToken), false);
  assert.deepEqual(scanContents('medal-key-should-not-match-by-name', tokens), []);
});

test('scans Next client output and a Studio bundle without printing the secret', () => {
  const cwd = fixture();
  try {
    writeFileSync(join(cwd, '.next/static/chunks/app.js'), `ok ${almostToken}`);
    mkdirSync(join(cwd, 'dist/static'), { recursive: true });
    writeFileSync(join(cwd, 'dist/static/studio.js'), `preview ${sanityToken}`);
    mkdirSync(join(cwd, '.next/static/chunks/node_modules'), { recursive: true });
    writeFileSync(join(cwd, '.next/static/chunks/node_modules/ignored.js'), viewerToken);

    const result = scanBundles({
      cwd,
      env: { SANITY_API_READ_TOKEN: viewerToken, GITHUB_TOKEN: 'gh-token-value-not-real' },
    });

    assert.equal(result.ok, false);
    assert.deepEqual(result.findings, [{ file: 'dist/static/studio.js', kind: 'sanity-pattern' }]);
    const report = formatReport(result);
    assert.match(report, /dist\/static\/studio\.js/);
    assert.match(report, /sk followed by 100\+ characters/);
    assert.equal(report.includes(sanityToken), false);
    assert.equal(report.includes(viewerToken), false);
  } finally {
    rmSync(cwd, { recursive: true, force: true });
  }
});

test('fails when a TOKEN value is inside .next/static', () => {
  const cwd = fixture();
  try {
    writeFileSync(join(cwd, '.next/static/chunks/app.js'), `token ${viewerToken}`);
    const result = scanBundles({ cwd, env: { SANITY_API_READ_TOKEN: `  ${viewerToken}  ` } });
    assert.equal(result.ok, false);
    assert.deepEqual(result.findings, [
      {
        file: '.next/static/chunks/app.js',
        kind: 'env-token',
        name: 'SANITY_API_READ_TOKEN',
      },
    ]);
    assert.equal(formatReport(result).includes(viewerToken), false);
  } finally {
    rmSync(cwd, { recursive: true, force: true });
  }
});

test('passes a clean client bundle and still requires .next/static', () => {
  const cwd = fixture();
  try {
    writeFileSync(join(cwd, '.next/static/chunks/app.js'), 'published content only');
    const result = scanBundles({ cwd, env: { SANITY_API_READ_TOKEN: viewerToken } });
    assert.equal(result.ok, true);
    assert.deepEqual(result.findings, []);
  } finally {
    rmSync(cwd, { recursive: true, force: true });
  }

  const missing = scanBundles({
    cwd: mkdtempSync(join(tmpdir(), 'client-tokens-missing-')),
    env: {},
  });
  assert.equal(missing.ok, false);
  assert.deepEqual(missing.missing, ['.next/static']);
  assert.match(formatReport(missing), /\.next\/static/);
});

test('the read token stays off public env, Docker build args, and workflow browser tokens', () => {
  const live = read('src/sanity/lib/live.ts');
  const token = read('src/sanity/lib/token.ts');
  const dockerfile = read('Dockerfile');
  const dockerScript = read('scripts/docker-build.sh');
  assert.match(token, /import 'server-only'/);
  assert.match(token, /SANITY_API_READ_TOKEN/);
  assert.doesNotMatch(token, /NEXT_PUBLIC_/);
  assert.match(live, /browserToken:\s*false/);
  assert.doesNotMatch(live, /NEXT_PUBLIC_/);
  assert.doesNotMatch(dockerfile, /SANITY_API_READ_TOKEN|NEXT_PUBLIC_SANITY_BROWSER_TOKEN/);
  assert.doesNotMatch(dockerScript, /SANITY_API_READ_TOKEN|NEXT_PUBLIC_SANITY_BROWSER_TOKEN/);
  for (const name of ['ci.yml', 'cloudflare-staging.yml', 'cloudflare-prod.yml']) {
    const workflow = read(`.github/workflows/${name}`);
    assert.doesNotMatch(workflow, /NEXT_PUBLIC_SANITY_BROWSER_TOKEN:/);
    assert.match(workflow, /SANITY_API_READ_TOKEN/);
    assert.match(workflow, /scan:client-tokens/);
  }
});
