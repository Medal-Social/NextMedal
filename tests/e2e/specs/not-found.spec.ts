import { expect, test } from '@playwright/test';
import { SUPPORTED_LOCALES } from '../../../src/i18n/config';

/**
 * Unknown URLs must return a real HTTP 404, not a soft 404.
 *
 * A route-level `loading.tsx` under `app/(frontend)/[locale]/` used to stream a
 * 200 shell before the catch-all page could call `notFound()`, so bogus URLs
 * answered 200 with 404-looking content and stayed indexed. Asserting on the
 * status code (not the page text) is the whole point of this spec.
 */
test.describe('Unknown routes', () => {
  for (const locale of SUPPORTED_LOCALES) {
    test(`returns HTTP 404 for an unknown ${locale} URL`, async ({ request }) => {
      const response = await request.get(`/${locale}/this-page-does-not-exist-${Date.now()}`, {
        maxRedirects: 5,
      });

      expect(response.status()).toBe(404);
    });
  }
});
