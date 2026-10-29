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
const READ_TOKEN = 'viewer_read_token_value';
const read = (file: string) =>
  readFileSync(resolve(__dirname, '../../../.github/workflows', file), 'utf8');

/** YAML for one step, from its `- name:` through the line before the next step. */
function stepBlock(source: string, name: string): string {
  const lines = source.split('\n');
  const start = lines.findIndex((line) => line.trim() === `- name: ${name}`);
  if (start < 0) throw new Error(`no step "${name}"`);
  let end = lines.length;
  for (let index = start + 1; index < lines.length; index++) {
    if (/^ {6}- /.test(lines[index] ?? '')) {
      end = index;
      break;
    }
  }
  return lines.slice(start, end).join('\n');
}

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

  it('fails before building when SANITY_API_READ_TOKEN is empty', () => {
    const readTokenCheck = stepScript(source, 'Require SANITY_API_READ_TOKEN');
    const result = run(readTokenCheck, { SANITY_API_READ_TOKEN: '' });
    expect(result.status).not.toBe(0);
    expect(result.stdout.toString()).toContain('SANITY_API_READ_TOKEN');
    expect(result.stdout.toString()).not.toContain(READ_TOKEN);
    expect(result.stderr.toString()).not.toContain(READ_TOKEN);
  });

  it('passes the read-token check without printing the value', () => {
    const readTokenCheck = stepScript(source, 'Require SANITY_API_READ_TOKEN');
    const result = run(readTokenCheck, { SANITY_API_READ_TOKEN: READ_TOKEN });
    expect(result.status).toBe(0);
    expect(`${result.stdout}${result.stderr}`).not.toContain(READ_TOKEN);
  });

  it('rejects a whitespace-only read token without printing it', () => {
    const readTokenCheck = stepScript(source, 'Require SANITY_API_READ_TOKEN');
    const result = run(readTokenCheck, { SANITY_API_READ_TOKEN: ' \t' });
    expect(result.status).not.toBe(0);
    expect(`${result.stdout}${result.stderr}`).not.toContain(READ_TOKEN);
  });

  it('skips the pre-deploy token upload only for the missing-Worker error', () => {
    const script = stepScript(source, 'Upload SANITY_API_READ_TOKEN');
    for (const listStderr of [
      'This Worker does not exist on your account. [code: 10007]',
      'code: 10007',
      'This Worker does not exist',
    ]) {
      const { status, calls, output } = runUpload(script, { listStatus: 1, listStderr });
      expect(status, listStderr).toBe(0);
      expect(calls.some((call) => call.includes('secret put'))).toBe(false);
      expect(output).not.toContain(READ_TOKEN);
    }
  });

  it('does not treat a broad not-found message as a missing Worker', () => {
    const script = stepScript(source, 'Upload SANITY_API_READ_TOKEN');
    for (const listStderr of [
      'Worker not found',
      'The secret does not exist',
      'Account does not exist',
      'request id 100070',
    ]) {
      const { status, calls, output } = runUpload(script, { listStatus: 1, listStderr });
      expect(status, listStderr).not.toBe(0);
      expect(calls.some((call) => call.includes('secret put'))).toBe(false);
      expect(output).toContain('Could not list');
      expect(output).not.toContain(READ_TOKEN);
    }
  });

  it('passes SANITY_API_READ_TOKEN only to the steps that read it', () => {
    const stepsAt = source.indexOf('\n    steps:\n');
    const envAt = source.lastIndexOf('\n    env:\n', stepsAt);
    expect(source.slice(envAt, stepsAt)).not.toContain('SANITY_API_READ_TOKEN');

    for (const name of [
      'Require SANITY_API_READ_TOKEN',
      'Build for Cloudflare Workers',
      'Scan client and Studio bundles for tokens',
      'Upload SANITY_API_READ_TOKEN',
      'Upload Worker secrets',
    ]) {
      expect(stepBlock(source, name)).toContain('secrets.SANITY_API_READ_TOKEN');
    }

    for (const name of [
      'Require MEDAL_API_KEY',
      'Checkout repository',
      'Setup pnpm',
      'Setup Node.js',
      'Install dependencies',
      'Deploy to Cloudflare',
      'Verify release freshness',
      'Summary',
    ]) {
      expect(stepBlock(source, name)).not.toContain('SANITY_API_READ_TOKEN');
    }
  });

  it('stops before deploy when listing Worker secrets fails for another reason', () => {
    const script = stepScript(source, 'Upload SANITY_API_READ_TOKEN');
    const { status, calls, output } = runUpload(script, {
      listStatus: 1,
      listStderr: 'Authentication error',
    });
    expect(status).not.toBe(0);
    expect(calls.some((call) => call.includes('secret put'))).toBe(false);
    expect(output).toContain('Could not list');
    expect(output).not.toContain(READ_TOKEN);
  });

  it('uploads the read token before deploy when the Worker already exists', () => {
    const script = stepScript(source, 'Upload SANITY_API_READ_TOKEN');
    const { status, calls, output } = runUpload(script, { listStatus: 0 });
    expect(status).toBe(0);
    expect(calls.filter((call) => call.includes('secret put SANITY_API_READ_TOKEN'))).toHaveLength(
      1
    );
    expect(output).not.toContain(READ_TOKEN);
    expect(calls.join('\n')).not.toContain(READ_TOKEN);
  });

  it('checks the read token and scans bundles before deploy', () => {
    expect(source.indexOf('- name: Require SANITY_API_READ_TOKEN')).toBeLessThan(
      source.indexOf('- name: Build for Cloudflare Workers')
    );
    expect(source.indexOf('- name: Scan client and Studio bundles for tokens')).toBeLessThan(
      source.indexOf('- name: Deploy to Cloudflare')
    );
    expect(source.indexOf('- name: Upload SANITY_API_READ_TOKEN')).toBeLessThan(
      source.indexOf('- name: Deploy to Cloudflare')
    );
  });

  it('uploads SANITY_API_READ_TOKEN without printing the value', () => {
    const { status, calls, output } = fakeUpload(source, ['MEDAL_API_KEY']);
    expect(status).toBe(0);
    expect(calls.filter((call) => call.includes('secret put SANITY_API_READ_TOKEN'))).toHaveLength(
      1
    );
    expect(output).not.toContain(READ_TOKEN);
    expect(calls.join('\n')).not.toContain(READ_TOKEN);
  });

  it('deletes a leftover public Sanity browser token from the Worker', () => {
    const { status, calls, output } = fakeUpload(source, [
      'MEDAL_API_KEY',
      'NEXT_PUBLIC_SANITY_BROWSER_TOKEN',
    ]);
    expect(status).toBe(0);
    expect(
      calls.filter((call) => call.includes('secret delete NEXT_PUBLIC_SANITY_BROWSER_TOKEN'))
    ).toHaveLength(1);
    expect(output).not.toContain(READ_TOKEN);
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
      SANITY_API_READ_TOKEN: READ_TOKEN,
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
    const output = `${result.stdout?.toString() ?? ''}${result.stderr?.toString() ?? ''}`;
    return { status: result.status, calls, output };
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

/** Runs one workflow script against a fake pnpm. `secret list` exits with listStatus. */
function runUpload(script: string, options: { listStatus: number; listStderr?: string }) {
  const dir = mkdtempSync(join(tmpdir(), 'nm-predeploy-'));
  try {
    const fake = join(dir, 'pnpm');
    const log = join(dir, 'calls.log');
    writeFileSync(
      fake,
      [
        '#!/bin/bash',
        'echo "$*" >> "$CALLS"',
        'if [[ "$*" == *"secret list"* ]]; then printf "%s" "$LIST_STDERR" >&2; exit "$LIST_STATUS"; fi',
        'cat > /dev/null',
        '',
      ].join('\n')
    );
    chmodSync(fake, 0o755);
    writeFileSync(log, '');
    const env = {
      PATH: `${dir}:/usr/bin:/bin`,
      HOME: dir,
      XDG_CONFIG_HOME: dir,
      CALLS: log,
      LIST_STATUS: String(options.listStatus),
      LIST_STDERR: options.listStderr ?? '',
      SANITY_API_READ_TOKEN: READ_TOKEN,
    } as unknown as NodeJS.ProcessEnv;
    if (Object.keys(env).some((key) => key.startsWith('CLOUDFLARE_'))) {
      throw new Error('refusing to run: Cloudflare credentials in the environment');
    }
    const resolved = spawnSync('bash', ['-c', 'command -v pnpm'], { env }).stdout.toString().trim();
    if (resolved !== fake) throw new Error(`refusing to run: pnpm resolves to ${resolved}`);
    const result = spawnSync('bash', ['-c', script], { env });
    const calls = readFileSync(log, 'utf8').trim().split('\n').filter(Boolean);
    const output = `${result.stdout?.toString() ?? ''}${result.stderr?.toString() ?? ''}`;
    return { status: result.status, calls, output };
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}
