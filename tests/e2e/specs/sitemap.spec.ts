import { expect, test } from '@playwright/test';

/**
 * Sitemap E2E Smoke Tests
 *
 * These tests verify that sitemap routes are accessible and properly configured.
 * They catch routing/rewrite issues that unit tests cannot detect since unit tests
 * bypass Next.js routing entirely.
 */

test.describe('Sitemap Routes', () => {
  test('sitemap index is accessible', async ({ request }) => {
    const response = await request.get('/sitemap.xml');

    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('xml');

    const body = await response.text();
    expect(body).toContain('<?xml');
    expect(body).toContain('<sitemapindex');
  });

  test('English sitemap is accessible via rewrite', async ({ request }) => {
    const response = await request.get('/sitemap-en.xml');

    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('xml');

    const body = await response.text();
    expect(body).toContain('<?xml');
    expect(body).toContain('<urlset');
    expect(body).toContain('xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"');
  });

  test('Norwegian sitemap is accessible via rewrite', async ({ request }) => {
    const response = await request.get('/sitemap-nb.xml');

    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('xml');

    const body = await response.text();
    expect(body).toContain('<?xml');
    expect(body).toContain('<urlset');
  });

  test('invalid locale redirects to sitemap index', async ({ request }) => {
    const response = await request.get('/sitemap-xx.xml', {
      maxRedirects: 0,
    });

    expect(response.status()).toBe(302);
    expect(response.headers().location).toContain('/sitemap.xml');
  });

  test('sitemaps include XSL stylesheet reference', async ({ request }) => {
    const response = await request.get('/sitemap-en.xml');
    const body = await response.text();

    expect(body).toContain('<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>');
  });

  test('sitemaps have proper cache headers', async ({ request }) => {
    const response = await request.get('/sitemap-en.xml');
    const cacheControl = response.headers()['cache-control'];

    expect(cacheControl).toContain('max-age=3600');
    expect(cacheControl).toContain('stale-while-revalidate');
  });
});
