import { spawnSync } from 'node:child_process';
import { chmodSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * Forms send to Medal Social only, so a deploy without MEDAL_API_KEY would ship
 * a site whose every form fails. The deploy workflows refuse instead.
 */
const workflows = ['cloudflare-prod.yml', 'cloudflare-staging.yml'];
const read = (file: string) =>
  readFileSync(resolve(__dirname, '../../../.github/workflows', file), 'utf8');

/** The `run: |` script of the step with this name (block scalar, indentation-based). */
function stepScript(source: string, name: string): string {
  const lines = source.split('\n');
  const start = lines.findIndex((line) => line.trim() === `- name: ${name}`);
  if (start < 0) throw new Error(`no step "${name}"`);
  const runAt = lines.findIndex((line, i) => i > start && /^\s*run: \|\s*$/.test(line));
  const indent = (lines[runAt + 1]?.match(/^\s*/)?.[0] ?? '').length;
  const body: string[] = [];
  for (const line of lines.slice(runAt + 1)) {
    if (line.trim() && (line.match(/^\s*/)?.[0] ?? '').length < indent) break;
    body.push(line.slice(indent));
  }
  return body.join('\n');
}

const run = (script: string, env: Record<string, string>) =>
  spawnSync('bash', ['-c', script], {
    env: { PATH: process.env.PATH ?? '', ...env } as unknown as NodeJS.ProcessEnv,
  });

describe.each(workflows)('%s', (file) => {
  const source = read(file);
  const check = stepScript(source, 'Require MEDAL_API_KEY');

  it('fails before building when MEDAL_API_KEY is empty', () => {
    const result = run(check, { MEDAL_API_KEY: '' });
    expect(result.status).not.toBe(0);
    expect(result.stdout.toString()).toContain('MEDAL_API_KEY');
  });

  it('passes when MEDAL_API_KEY is set', () => {
    expect(run(check, { MEDAL_API_KEY: 'medal_x' }).status).toBe(0);
  });

  it('runs the check before the build', () => {
    expect(source.indexOf('- name: Require MEDAL_API_KEY')).toBeLessThan(
      source.indexOf('- name: Build for Cloudflare Workers')
    );
  });

  it('only deletes MEDAL_API_ENDPOINT from the Worker when it is empty', () => {
    const upload = stepScript(source, 'Upload Worker secrets');
    expect(upload).toMatch(/for name in MEDAL_API_ENDPOINT; do/);
    expect(upload).not.toMatch(/secret put "?\$?\{?SANITY_WRITE_TOKEN/);
  });

  it('deletes the retired SANITY_WRITE_TOKEN still on the Worker (deploys keep vars)', () => {
    const { status, calls } = fakeUpload(source, ['MEDAL_API_KEY', 'SANITY_WRITE_TOKEN']);
    expect(status).toBe(0);
    expect(calls.filter((c) => c.includes('secret delete SANITY_WRITE_TOKEN'))).toHaveLength(1);
  });

  it('deletes a deployed MEDAL_API_ENDPOINT when the CI value is empty (docs/CLOUDFLARE.md)', () => {
    const { status, calls } = fakeUpload(source, ['MEDAL_API_KEY', 'MEDAL_API_ENDPOINT']);
    expect(status).toBe(0);
    expect(calls.filter((c) => c.includes('secret delete MEDAL_API_ENDPOINT'))).toHaveLength(1);
  });

  it('leaves the Worker alone when the retired token is gone', () => {
    const { status, calls } = fakeUpload(source, ['MEDAL_API_KEY']);
    expect(status).toBe(0);
    expect(calls.some((c) => c.includes('SANITY_WRITE_TOKEN'))).toBe(false);
  });
});

/**
 * Runs the "Upload Worker secrets" step against a fake `pnpm` that only logs.
 * The PATH holds the fake and the system dirs only, and the run refuses unless
 * `pnpm` resolves to the fake: the real one would reach the live Workers.
 */
function fakeUpload(source: string, secretsOnWorker: string[]) {
  const dir = mkdtempSync(join(tmpdir(), 'nm-deploy-'));
  try {
    const fake = join(dir, 'pnpm');
    const log = join(dir, 'calls.log');
    writeFileSync(
      fake,
      [
        '#!/bin/bash',
        'echo "$*" >> "$CALLS"',
        'if [[ "$*" == *"secret list"* ]]; then echo "$SECRETS_JSON"; else cat > /dev/null; fi',
        '',
      ].join('\n')
    );
    chmodSync(fake, 0o755);
    writeFileSync(log, '');
    // No credentials reach the subprocess: no Cloudflare variables, and HOME /
    // XDG_CONFIG_HOME point at the empty temp dir (no wrangler login).
    const env = {
      PATH: `${dir}:/usr/bin:/bin`,
      HOME: dir,
      XDG_CONFIG_HOME: dir,
      CALLS: log,
      SECRETS_JSON: JSON.stringify(secretsOnWorker.map((name) => ({ name }))),
      MEDAL_API_KEY: 'medal_x',
    } as unknown as NodeJS.ProcessEnv;
    if (Object.keys(env).some((key) => key.startsWith('CLOUDFLARE_'))) {
      throw new Error('refusing to run: Cloudflare credentials in the environment');
    }
    const resolved = spawnSync(
      'bash',
      ['-c', 'command -v pnpm; command -v wrangler; command -v npx; true'],
      { env }
    )
      .stdout.toString()
      .trim();
    if (resolved !== fake) throw new Error(`refusing to run: pnpm resolves to ${resolved}`);
    const result = spawnSync('bash', ['-c', stepScript(source, 'Upload Worker secrets')], { env });
    const calls = readFileSync(log, 'utf8').trim().split('\n').filter(Boolean);
    return { status: result.status, calls };
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}
