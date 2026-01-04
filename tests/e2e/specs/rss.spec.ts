import { expect, test } from '@playwright/test';
import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from '../../../src/i18n/config';

/**
 * RSS Feed E2E Smoke Tests
 *
 * These tests verify that RSS feed routes are accessible and properly configured.
 * RSS feeds are generated dynamically for collection pages (articles, changelog, newsletter, etc.)
 *
 * Route pattern: /[locale]/[collection]/rss.xml
 * Example: /en/articles/rss.xml, /nb/changelog/rss.xml
 *
 * These tests dynamically cover all locales defined in src/i18n/config.ts
 */

// Known collection slugs to test - update these based on your CMS content
const COLLECTION_SLUGS = ['articles', 'changelog', 'newsletter', 'docs', 'events'];

test.describe('RSS Feed Routes', () => {
  test('at least one collection RSS feed is accessible', async ({ request }) => {
    // Try each known collection until we find one that works
    let foundValidFeed = false;

    for (const collection of COLLECTION_SLUGS) {
      const response = await request.get(`/${DEFAULT_LOCALE}/${collection}/rss.xml`);

      if (response.status() === 200) {
        foundValidFeed = true;
        const body = await response.text();

        // Verify RSS structure
        expect(body).toContain('<?xml');
        expect(body).toContain('<rss version="2.0"');
        expect(body).toContain('<channel>');
        break;
      }
    }

    // At least one collection should have RSS
    expect(foundValidFeed).toBe(true);
  });

  test('RSS feed returns proper Content-Type header', async ({ request }) => {
    for (const collection of COLLECTION_SLUGS) {
      const response = await request.get(`/${DEFAULT_LOCALE}/${collection}/rss.xml`);

      if (response.status() === 200) {
        expect(response.headers()['content-type']).toContain('xml');
        return;
      }
    }

    // Skip if no collections found
    test.skip();
  });

  test('RSS feed includes cache headers', async ({ request }) => {
    for (const collection of COLLECTION_SLUGS) {
      const response = await request.get(`/${DEFAULT_LOCALE}/${collection}/rss.xml`);

      if (response.status() === 200) {
        const cacheControl = response.headers()['cache-control'];
        expect(cacheControl).toContain('s-maxage=3600');
        expect(cacheControl).toContain('stale-while-revalidate');
        return;
      }
    }

    test.skip();
  });

  test('RSS feed includes XSL stylesheet reference', async ({ request }) => {
    for (const collection of COLLECTION_SLUGS) {
      const response = await request.get(`/${DEFAULT_LOCALE}/${collection}/rss.xml`);

      if (response.status() === 200) {
        const body = await response.text();
        expect(body).toContain('<?xml-stylesheet type="text/xsl" href="/rss.xsl"?>');
        return;
      }
    }

    test.skip();
  });

  test('RSS feed contains required channel elements', async ({ request }) => {
    for (const collection of COLLECTION_SLUGS) {
      const response = await request.get(`/${DEFAULT_LOCALE}/${collection}/rss.xml`);

      if (response.status() === 200) {
        const body = await response.text();

        // Required RSS 2.0 channel elements
        expect(body).toContain('<title>');
        expect(body).toContain('<link>');
        expect(body).toContain('<description>');
        expect(body).toContain(`<language>${DEFAULT_LOCALE}</language>`);
        expect(body).toContain('<lastBuildDate>');
        expect(body).toContain('<atom:link');
        return;
      }
    }

    test.skip();
  });

  test('invalid collection returns 404', async ({ request }) => {
    const response = await request.get(`/${DEFAULT_LOCALE}/nonexistent-collection-xyz/rss.xml`);

    expect(response.status()).toBe(404);
  });

  // Dynamically test all non-default locales
  for (const locale of SUPPORTED_LOCALES.filter((l) => l !== DEFAULT_LOCALE)) {
    test(`${locale} locale RSS feed is accessible`, async ({ request }) => {
      for (const collection of COLLECTION_SLUGS) {
        const response = await request.get(`/${locale}/${collection}/rss.xml`);

        if (response.status() === 200) {
          const body = await response.text();
          expect(body).toContain(`<language>${locale}</language>`);
          return;
        }
      }

      // Content may not exist for this locale - skip rather than fail
      test.skip();
    });
  }
});
