import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

/**
 * WCAG accessibility tests using axe-core.
 * Tests key pages for accessibility violations.
 *
 * Run with: pnpm e2e:a11y
 */
test.describe('WCAG Accessibility Tests', () => {
  test('homepage should have no accessibility violations', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('load');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('homepage should have proper heading structure', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('load');

    // Check for single h1
    const h1Count = await page.locator('h1').count();
    expect(h1Count).toBe(1);

    // Check heading hierarchy
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['best-practice'])
      .include('main')
      .analyze();

    const headingViolations = accessibilityScanResults.violations.filter((v) =>
      v.id.includes('heading')
    );
    expect(headingViolations).toEqual([]);
  });

  test('images should have alt text', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('load');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withRules(['image-alt'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('interactive elements should be keyboard accessible', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('load');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['keyboard'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });
});
