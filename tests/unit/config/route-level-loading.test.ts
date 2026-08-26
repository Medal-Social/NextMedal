import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * Regression guard for real HTTP 404s.
 *
 * A `loading.tsx` directly under `app/(frontend)/[locale]/` streams a 200 shell
 * to the client before the catch-all `[...slug]` page can call `notFound()`.
 * Once the response has started with a 200 the status can no longer change, so
 * every unknown URL soft-404s and search engines index pages that don't exist.
 *
 * Nested loading files (inside a specific subroute) are fine — only the
 * route-level one intercepts the catch-all's status.
 */
describe('route-level loading boundary', () => {
  it('does not exist at the [locale] root, so notFound() can set a real 404', () => {
    const routeLevelLoading = join(process.cwd(), 'src/app/(frontend)/[locale]/loading.tsx');

    expect(existsSync(routeLevelLoading)).toBe(false);
  });
});
