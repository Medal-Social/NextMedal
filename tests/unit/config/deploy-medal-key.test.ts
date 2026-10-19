import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
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
    expect(upload).not.toContain('SANITY_WRITE_TOKEN');
  });
});
