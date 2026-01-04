import { expect, test } from '@playwright/test';

test.describe('Article Fallback OG Image Smoke Tests', () => {
  test('should generate OG image for English articles', async ({ page }) => {
    const response = await page.goto('/api/og/article-fallback?title=Test%20Article&locale=en');

    expect(response?.status()).toBe(200);
    expect(response?.headers()['content-type']).toContain('image/png');
  });

  test('should generate OG image for Norwegian articles', async ({ page }) => {
    const response = await page.goto('/api/og/article-fallback?title=Test%20Artikkel&locale=nb');

    expect(response?.status()).toBe(200);
    expect(response?.headers()['content-type']).toContain('image/png');
  });

  test('should generate OG image for Arabic articles', async ({ page }) => {
    const response = await page.goto(
      '/api/og/article-fallback?title=%D8%BA%D9%88%D8%B5%20%D8%B9%D9%85%D9%8A%D9%82&locale=ar'
    );

    expect(response?.status()).toBe(200);
    expect(response?.headers()['content-type']).toContain('image/png');
  });

  test('should handle missing parameters gracefully', async ({ page }) => {
    const response = await page.goto('/api/og/article-fallback');

    // Should still return 200 with fallback content
    expect(response?.status()).toBe(200);
    expect(response?.headers()['content-type']).toContain('image/png');
  });

  test('should return valid PNG image', async ({ page }) => {
    const response = await page.goto('/api/og/article-fallback?title=Test&locale=en');

    const buffer = await response?.body();
    expect(buffer).toBeTruthy();

    // Check PNG signature (first 8 bytes)
    const pngSignature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
    const actualSignature = buffer?.slice(0, 8);
    expect(actualSignature?.toString('hex')).toBe(pngSignature.toString('hex'));
  });
});
