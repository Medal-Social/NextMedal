import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const appRoot = resolve(__dirname, '../../..');

// wrangler.jsonc allows comments; strip them before parsing. The regex only
// handles whole-line `//` comments (no block or trailing comments); jsonc-parser
// is not a dependency of this app.
const raw = readFileSync(resolve(appRoot, 'wrangler.jsonc'), 'utf8').replace(/^\s*\/\/.*$/gm, '');
const config = JSON.parse(raw) as {
  vars: Record<string, string>;
  env: { production: { vars: Record<string, string> } };
};

// Next.js inlines NEXT_PUBLIC_* at build time, so the workflow env wins over the Worker vars.
const workflowDataset = (file: string) =>
  readFileSync(resolve(appRoot, '.github/workflows', file), 'utf8').match(
    /^\s*NEXT_PUBLIC_SANITY_DATASET:\s*['"]?([\w-]+)['"]?\s*$/m
  )?.[1];

describe('datasets per Worker (Vault plan 2026-10-18, Task 4)', () => {
  it('staging reads its own dataset', () => {
    expect(config.vars.NEXT_PUBLIC_SANITY_DATASET).toBe('staging');
  });
  it('production reads production', () => {
    expect(config.env.production.vars.NEXT_PUBLIC_SANITY_DATASET).toBe('production');
  });
  it('the staging build bakes in the staging dataset', () => {
    expect(workflowDataset('cloudflare-staging.yml')).toBe('staging');
  });
  it('the production build bakes in the production dataset', () => {
    expect(workflowDataset('cloudflare-prod.yml')).toBe('production');
  });
});
