import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

// wrangler.jsonc allows comments; strip them before parsing.
const raw = readFileSync(resolve(__dirname, '../../../wrangler.jsonc'), 'utf8').replace(
  /^\s*\/\/.*$/gm,
  ''
);
const config = JSON.parse(raw) as {
  vars: Record<string, string>;
  env: { production: { vars: Record<string, string> } };
};

describe('datasets per Worker (Vault plan 2026-10-18, Task 4)', () => {
  it('staging reads its own dataset', () => {
    expect(config.vars.NEXT_PUBLIC_SANITY_DATASET).toBe('staging');
  });
  it('production reads production', () => {
    expect(config.env.production.vars.NEXT_PUBLIC_SANITY_DATASET).toBe('production');
  });
});
