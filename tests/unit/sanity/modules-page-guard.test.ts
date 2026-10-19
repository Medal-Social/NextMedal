import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const ROUTES = [
  'src/app/(frontend)/[locale]/page.tsx',
  'src/app/(frontend)/[locale]/[...slug]/page.tsx',
  'src/app/(frontend)/[locale]/not-found.tsx',
];

describe('every <Modules> fed with page modules also gets the page (design rules are page-aware)', () => {
  it.each(ROUTES)('%s', (file) => {
    const source = readFileSync(resolve(__dirname, '../../..', file), 'utf8');
    const calls = source.match(/<Modules\b[^>]*modules=\{page[^>]*>/g) ?? [];
    expect(calls.length).toBeGreaterThan(0);
    for (const call of calls) expect(call, call).toMatch(/\bpage=\{page\b/);
  });
});
