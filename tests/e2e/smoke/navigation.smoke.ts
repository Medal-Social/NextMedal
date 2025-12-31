import { expect, test } from '@playwright/test';

/**
 * Navigation smoke tests verify critical navigation paths work.
 *
 * Run with: pnpm e2e:smoke
 */
test.describe('Navigation Smoke Tests', () => {
  test('main navigation is accessible', async ({ page }) => {
    await page.goto('/');

    // Header navigation should be visible
    const nav = page.locator('header nav').first();
    await expect(nav).toBeVisible();
  });

  test('footer links are present', async ({ page }) => {
    await page.goto('/');

    // Footer should contain links
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();

    const footerLinks = footer.locator('a');
    const linkCount = await footerLinks.count();
    expect(linkCount).toBeGreaterThan(0);
  });

  test('language switcher is functional', async ({ page }) => {
    await page.goto('/en');

    // Look for language switcher (using comma-separated selectors)
    const langSwitcher = page.locator(
      '[data-testid="language-switcher"], button:has-text("English"), button:has-text("Norsk")'
    );

    // If language switcher exists, it should be clickable
    if ((await langSwitcher.count()) > 0) {
      await expect(langSwitcher.first()).toBeEnabled();
    }
  });
});
