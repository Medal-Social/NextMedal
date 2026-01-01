import { expect, test } from '@playwright/test';

/**
 * Smoke tests are quick critical path tests that run on every commit.
 * They verify that essential functionality works without deep testing.
 *
 * Run with: pnpm e2e:smoke
 */
test.describe('Homepage Smoke Tests', () => {
  test('homepage loads and shows critical elements', async ({ page }) => {
    // Collect console errors
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text());
    });

    await page.goto('/');

    // Wait for page to be fully loaded (DOM + resources)
    await page.waitForLoadState('load');

    // Critical elements should be visible
    await expect(page.locator('header')).toBeVisible();
    await expect(page.locator('main')).toBeVisible();
    await expect(page.locator('footer')).toBeVisible();

    // No critical console errors
    const criticalErrors = errors.filter((e) => !e.includes('favicon') && !e.includes('analytics'));
    expect(criticalErrors).toHaveLength(0);
  });

  test('page has correct title and meta tags', async ({ page }) => {
    await page.goto('/');

    // Title should exist
    const title = await page.title();
    expect(title).toBeTruthy();
    expect(title.length).toBeGreaterThan(0);

    // Meta description should exist
    const description = await page.getAttribute('meta[name="description"]', 'content');
    expect(description).toBeTruthy();
  });
});
