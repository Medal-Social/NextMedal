import { expect, test } from '@playwright/test';

/**
 * Responsive visual regression tests capture screenshots at different viewport sizes.
 *
 * Run with: pnpm e2e:visual
 * Update baselines with: pnpm e2e:visual:update
 */
const viewports = [
  { name: 'mobile', width: 375, height: 667 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1280, height: 800 },
];

test.describe('Responsive Visual Regression', () => {
  for (const viewport of viewports) {
    test(`homepage at ${viewport.name} (${viewport.width}x${viewport.height})`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto('/');
      await page.waitForLoadState('load');
      await page.waitForTimeout(500);

      await expect(page).toHaveScreenshot(`homepage-${viewport.name}.png`, {
        fullPage: true,
        maxDiffPixelRatio: 0.01,
      });
    });
  }
});
