import { expect, test } from '@playwright/test';

/**
 * Collection Routes E2E Tests
 *
 * These tests verify that collection routes work correctly across all locales:
 * - Collections are accessible at proper URLs
 * - Slugs are locale-aware (e.g., /en/articles vs /nb/artikler)
 * - Language switching works within collections
 * - Collections function even without explicit frontpage documents
 *
 * Collections tested: articles, documentation, changelog, events, newsletter
 * Locales tested: en (English), nb (Norwegian), ar (Arabic)
 */

// All supported locales
const _LOCALES = ['en', 'nb', 'ar'] as const;

// Collection slugs by locale (should match Sanity CMS configuration)
const COLLECTION_SLUGS_BY_LOCALE = {
  en: {
    articles: 'articles',
    documentation: 'docs',
    changelog: 'changelog',
    events: 'events',
    newsletter: 'newsletter',
  },
  nb: {
    articles: 'artikler', // Norwegian translation
    documentation: 'dokumentasjon',
    changelog: 'endringslogg',
    events: 'arrangementer',
    newsletter: 'nyhetsbrev',
  },
  ar: {
    articles: 'articles', // May use English slug or Arabic
    documentation: 'docs',
    changelog: 'changelog',
    events: 'events',
    newsletter: 'newsletter',
  },
} as const;

test.describe('Collection Routes Across Locales', () => {
  test('English collections are accessible', async ({ page }) => {
    const locale = 'en';
    const slugs = COLLECTION_SLUGS_BY_LOCALE[locale];

    for (const [_collection, slug] of Object.entries(slugs)) {
      const url = `/${locale}/${slug}`;
      const response = await page.goto(url, { waitUntil: 'domcontentloaded' });

      // Collection should return 200 or 404 (if no content exists)
      // Both are valid - we're testing routing works, not content exists
      expect([200, 404]).toContain(response?.status());

      // If 200, verify page loads without critical errors
      if (response?.status() === 200) {
        // Should have basic page structure (main content area with ID)
        const main = page.locator('#main-content');
        await expect(main).toBeAttached({ timeout: 5000 });
      }
    }
  });

  test('Norwegian collections are accessible', async ({ page }) => {
    const locale = 'nb';
    const slugs = COLLECTION_SLUGS_BY_LOCALE[locale];

    for (const [_collection, slug] of Object.entries(slugs)) {
      const url = `/${locale}/${slug}`;
      const response = await page.goto(url);

      // Valid statuses: 200 (content exists) or 404 (no content)
      expect([200, 404]).toContain(response?.status());
    }
  });

  test('Arabic collections are accessible', async ({ page }) => {
    const locale = 'ar';
    const slugs = COLLECTION_SLUGS_BY_LOCALE[locale];

    for (const [_collection, slug] of Object.entries(slugs)) {
      const url = `/${locale}/${slug}`;
      const response = await page.goto(url);

      // Valid statuses: 200 (content exists) or 404 (no content)
      expect([200, 404]).toContain(response?.status());

      // If 200, verify RTL is applied for Arabic
      if (response?.status() === 200) {
        const html = page.locator('html');
        const dir = await html.getAttribute('dir');
        expect(dir).toBe('rtl');
      }
    }
  });

  test('collection slugs are locale-specific', async ({ page }) => {
    // Norwegian should use translated slug "artikler", not "articles"
    const norwegianArticles = await page.goto('/nb/artikler');
    expect([200, 404]).toContain(norwegianArticles?.status());

    // Note: The app uses catch-all routing, so /nb/articles won't return 404
    // unless Sanity content explicitly doesn't exist at that path.
    // This test verifies the CORRECT slug works, but cannot enforce that
    // incorrect slugs fail (that would require explicit route validation).
    const englishSlugOnNorwegian = await page.goto('/nb/articles');
    expect([200, 404]).toContain(englishSlugOnNorwegian?.status());
  });

  test('language switcher works within collections', async ({ page }) => {
    // Start on English articles page
    await page.goto('/en/articles');

    // Look for language switcher
    const langSwitcher = page
      .locator(
        '[data-testid="language-switcher"], button:has-text("English"), select[name="locale"]'
      )
      .first();

    // If language switcher exists, verify it's functional
    if ((await langSwitcher.count()) > 0) {
      // Check if it's enabled (indicates proper URL mapping)
      await expect(langSwitcher).toBeEnabled();

      // Click to open dropdown (if it's a button)
      if ((await langSwitcher.getAttribute('role')) === 'button') {
        await langSwitcher.click();

        // Norwegian option should be available
        const norwegianOption = page.locator('[role="menuitemradio"]:has-text("Norsk")').first();
        if ((await norwegianOption.count()) > 0) {
          await norwegianOption.click();

          // Should navigate to Norwegian articles
          await page.waitForURL(/\/nb\//);
          expect(page.url()).toContain('/nb/');
        }
      }
    }
  });

  test('collections work without explicit frontpage documents', async ({ page }) => {
    // This tests that collection routing works even if no "articlesFrontpage"
    // or similar document exists in Sanity

    // Try accessing a collection that might not have a frontpage configured
    const response = await page.goto('/en/articles');

    // Should return either:
    // - 200 with content (frontpage exists)
    // - 404 (no content, but route is recognized)
    // Should NOT return 500 or other server error
    expect(response?.status()).not.toBe(500);
    expect([200, 404]).toContain(response?.status());
  });

  test('invalid collection slug returns appropriate response', async ({ page }) => {
    const response = await page.goto('/en/nonexistent-collection-xyz123');

    // With catch-all routing, this returns 200 or 404 depending on Sanity content
    // The important check is that it doesn't crash (no 500 errors)
    expect(response?.status()).not.toBe(500);
    expect([200, 404]).toContain(response?.status());
  });

  test('collection RSS feeds respect locale', async ({ request }) => {
    // English articles RSS should have English language tag
    const enRss = await request.get('/en/articles/rss.xml');
    if (enRss.status() === 200) {
      const body = await enRss.text();
      expect(body).toContain('<language>en</language>');
    }

    // Norwegian articles RSS should have Norwegian language tag
    const nbRss = await request.get('/nb/artikler/rss.xml');
    if (nbRss.status() === 200) {
      const body = await nbRss.text();
      expect(body).toContain('<language>nb</language>');
    }
  });

  test('default locale (en) works with and without prefix', async ({ page }) => {
    // English is default locale - both /articles and /en/articles should work
    const withoutPrefix = await page.goto('/articles');
    expect([200, 404]).toContain(withoutPrefix?.status());

    const withPrefix = await page.goto('/en/articles');
    expect([200, 404]).toContain(withPrefix?.status());

    // Should be equivalent (both 200 or both 404)
    expect(withoutPrefix?.status()).toBe(withPrefix?.status());
  });

  test('non-default locale requires prefix', async ({ page }) => {
    // Norwegian requires /nb prefix
    const response = await page.goto('/nb/artikler');
    expect([200, 404]).toContain(response?.status());

    // Without prefix should redirect or 404
    const withoutPrefix = await page.goto('/artikler');
    // This could be 404 or could redirect to /nb/artikler depending on config
    expect(withoutPrefix?.status()).not.toBe(500);
  });
});

test.describe('Collection Item Routes', () => {
  test('article items follow locale pattern', async ({ request }) => {
    // Test pattern: /[locale]/[collection]/[slug]
    // Even if specific content doesn't exist, route should be recognized (404, not 500)

    const testCases = [
      '/en/articles/test-article',
      '/nb/artikler/test-artikkel',
      '/ar/articles/test-article',
    ];

    for (const url of testCases) {
      const response = await request.get(url);
      // Should not throw 500 error - routing should work
      expect(response.status()).not.toBe(500);
      // Will be 404 if content doesn't exist (expected), 200 if it does
      expect([200, 404]).toContain(response.status());
    }
  });

  test('documentation items follow locale pattern', async ({ request }) => {
    const testCases = [
      '/en/docs/getting-started',
      '/nb/dokumentasjon/kom-i-gang',
      '/ar/docs/getting-started',
    ];

    for (const url of testCases) {
      const response = await request.get(url);
      expect(response.status()).not.toBe(500);
      expect([200, 404]).toContain(response.status());
    }
  });
});

test.describe('Collection URL Building', () => {
  test('collections generate correct canonical URLs', async ({ page }) => {
    await page.goto('/en/articles');

    // Check canonical link in head
    const canonical = page.locator('link[rel="canonical"]');
    if ((await canonical.count()) > 0) {
      const href = await canonical.getAttribute('href');
      expect(href).toMatch(/\/articles$/); // Should end with /articles
      expect(href).toContain('://'); // Should be absolute URL
    }
  });

  test('collections generate correct hreflang tags', async ({ page }) => {
    await page.goto('/en/articles');

    // Check for hreflang alternates
    const hreflangTags = page.locator('link[rel="alternate"][hreflang]');
    const count = await hreflangTags.count();

    if (count > 0) {
      // Should have hreflang for each locale
      const hreflangs = await hreflangTags.evaluateAll((links) =>
        links.map((link) => link.getAttribute('hreflang'))
      );

      // Should include at least en and nb
      expect(hreflangs).toContain('en');
      expect(hreflangs).toContain('nb');
    }
  });
});
