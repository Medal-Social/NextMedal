import { expect, test } from '@playwright/test';

/**
 * Visual regression tests capture screenshots and compare against baselines.
 * These help catch unintended UI changes.
 *
 * Run with: pnpm e2e:visual
 * Update baselines with: pnpm e2e:visual:update
 */
test.describe('Page Visual Regression', () => {
  test('homepage matches baseline', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('load');

    // Wait for any animations to complete
    await page.waitForTimeout(500);

    await expect(page).toHaveScreenshot('homepage.png', {
      fullPage: true,
      // Allow 1% pixel difference for font rendering variations
      maxDiffPixelRatio: 0.01,
    });
  });

  test('homepage header matches baseline', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('load');

    const header = page.locator('header');
    await expect(header).toHaveScreenshot('header.png', {
      maxDiffPixelRatio: 0.01,
    });
  });

  test('homepage footer matches baseline', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('load');

    const footer = page.locator('footer');
    await expect(footer).toHaveScreenshot('footer.png', {
      maxDiffPixelRatio: 0.01,
    });
  });
});
