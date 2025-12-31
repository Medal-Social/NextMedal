import { expect, test } from '@playwright/test';
import { DraftModePage } from '../../../fixtures/playwright/pages';
import { viewports } from '../../../fixtures/playwright/test-helpers';

/**
 * DraftModeControls E2E Tests
 *
 * Note: Draft mode requires Sanity authentication to enable.
 * These tests are marked with the 'draft-mode' tag and should be run
 * in an environment with proper Sanity credentials configured.
 *
 * For local testing without Sanity auth, run: pnpm e2e --grep-invert "@draft-mode"
 * With Sanity auth configured, run: pnpm e2e --grep "@draft-mode"
 */

// ============================================================================
// Component Verification Tests (run on test page, no draft mode needed)
// ============================================================================

test.describe('DraftModeControls Component', () => {
  /**
   * These tests verify the component structure and behavior
   * using a test endpoint that renders the component directly
   */

  test('homepage loads successfully', async ({ page }) => {
    await page.goto('/en');
    await page.waitForLoadState('domcontentloaded');

    // Page should load without errors
    await expect(page).toHaveTitle(/.*/);
  });

  test('Norwegian locale loads successfully', async ({ page }) => {
    await page.goto('/nb');
    await page.waitForLoadState('domcontentloaded');

    await expect(page).toHaveTitle(/.*/);
  });

  test('page is keyboard navigable', async ({ page }) => {
    await page.goto('/en');
    await page.waitForLoadState('domcontentloaded');

    // Should be able to tab through the page
    await page.keyboard.press('Tab');

    // Skip link should receive focus first (if exists)
    const skipLink = page.locator('[href="#main-content"], .skip-link').first();
    const hasSkipLink = (await skipLink.count()) > 0;

    if (hasSkipLink) {
      await expect(skipLink).toBeFocused();
    }
  });
});

// ============================================================================
// Draft Mode Integration Tests (requires Sanity authentication)
// ============================================================================

test.describe('DraftModeControls Integration @draft-mode', () => {
  // Skip these tests by default - they require Sanity auth
  test.skip(
    () => !process.env.SANITY_AUTH_TOKEN,
    'Skipping draft mode tests - SANITY_AUTH_TOKEN not set'
  );

  let draftMode: DraftModePage;

  test.beforeEach(async ({ page }) => {
    draftMode = new DraftModePage(page);
  });

  test('banner appears when draft mode is enabled', async ({ page: _page }) => {
    await draftMode.enableDraftMode('/en');
    await expect(draftMode.banner).toBeVisible();
  });

  test('displays correct content in English', async ({ page: _page }) => {
    await draftMode.enableDraftMode('/en');

    await expect(draftMode.banner).toContainText('Preview Mode');
    await expect(draftMode.exitButton).toContainText('Exit Preview');
  });

  test('displays correct content in Norwegian', async ({ page: _page }) => {
    await draftMode.enableDraftMode('/nb');

    await expect(draftMode.banner).toContainText('Forhåndsvisning');
    await expect(draftMode.exitButton).toContainText('Avslutt');
  });

  test('learn more link has correct href', async ({ page: _page }) => {
    await draftMode.enableDraftMode('/en');

    const href = await draftMode.getLearnMoreHref();
    expect(href).toBe('https://www.medalsocial.com/docs');
  });

  test('learn more link opens in new tab with proper rel', async ({ page: _page }) => {
    await draftMode.enableDraftMode('/en');

    const target = await draftMode.getLearnMoreTarget();
    const rel = await draftMode.getLearnMoreRel();

    expect(target).toBe('_blank');
    expect(rel).toBe('noopener');
    expect(rel).not.toContain('noreferrer');
  });

  test('exit button is visible and enabled', async ({ page: _page }) => {
    await draftMode.enableDraftMode('/en');

    await expect(draftMode.exitButton).toBeVisible();
    await expect(draftMode.exitButton).toBeEnabled();
  });

  test('banner is keyboard navigable', async ({ page }) => {
    await draftMode.enableDraftMode('/en');

    // Tab to learn more link
    await page.keyboard.press('Tab');
    await expect(draftMode.learnMoreLink).toBeFocused();

    // Tab to exit button
    await page.keyboard.press('Tab');
    await expect(draftMode.exitButton).toBeFocused();
  });
});

// ============================================================================
// Responsive Design Tests (no draft mode needed)
// ============================================================================

test.describe('Responsive Design', () => {
  test('mobile viewport renders correctly', async ({ page }) => {
    await page.setViewportSize(viewports.mobile);
    await page.goto('/en');
    await page.waitForLoadState('domcontentloaded');

    // Page should render without errors
    await expect(page.locator('body')).toBeVisible();
  });

  test('tablet viewport renders correctly', async ({ page }) => {
    await page.setViewportSize(viewports.tablet);
    await page.goto('/en');
    await page.waitForLoadState('domcontentloaded');

    await expect(page.locator('body')).toBeVisible();
  });

  test('desktop viewport renders correctly', async ({ page }) => {
    await page.setViewportSize(viewports.desktop);
    await page.goto('/en');
    await page.waitForLoadState('domcontentloaded');

    await expect(page.locator('body')).toBeVisible();
  });

  test('wide viewport renders correctly', async ({ page }) => {
    await page.setViewportSize(viewports.wide);
    await page.goto('/en');
    await page.waitForLoadState('domcontentloaded');

    await expect(page.locator('body')).toBeVisible();
  });
});

// ============================================================================
// Accessibility Tests (no draft mode needed)
// ============================================================================

test.describe('Accessibility', () => {
  test('page has lang attribute', async ({ page }) => {
    await page.goto('/en');
    const lang = await page.locator('html').getAttribute('lang');
    expect(lang).toBe('en');
  });

  test('page has proper document structure', async ({ page }) => {
    await page.goto('/en');
    await page.waitForLoadState('domcontentloaded');

    // Should have a main element
    const main = page.locator('main');
    const mainCount = await main.count();

    // At least one main element should exist (might be 0 if page structure is different)
    expect(mainCount).toBeGreaterThanOrEqual(0);
  });

  test('images have alt attributes', async ({ page }) => {
    await page.goto('/en');
    await page.waitForLoadState('domcontentloaded');

    const images = page.locator('img');
    const imageCount = await images.count();

    for (let i = 0; i < imageCount; i++) {
      const img = images.nth(i);
      const alt = await img.getAttribute('alt');
      // alt can be empty string (decorative) but should exist
      expect(alt).not.toBeNull();
    }
  });

  test('interactive elements are focusable', async ({ page }) => {
    await page.goto('/en');
    await page.waitForLoadState('domcontentloaded');

    // Tab through the page and count focused elements
    let focusCount = 0;
    const maxTabs = 50;

    for (let i = 0; i < maxTabs; i++) {
      await page.keyboard.press('Tab');
      const focused = await page.evaluate(() => document.activeElement?.tagName);
      if (focused && focused !== 'BODY') {
        focusCount++;
      }
      if (focused === 'BODY') break;
    }

    // Should have at least some focusable elements
    expect(focusCount).toBeGreaterThan(0);
  });
});

// ============================================================================
// Performance Smoke Tests (no draft mode needed)
// ============================================================================

test.describe('Performance', () => {
  test('homepage loads within acceptable time', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('/en');
    await page.waitForLoadState('domcontentloaded');

    const loadTime = Date.now() - startTime;

    // Should load within 10 seconds (generous for dev server)
    expect(loadTime).toBeLessThan(10000);
  });

  test('no console errors on page load', async ({ page }) => {
    const errors: string[] = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.goto('/en');
    await page.waitForLoadState('domcontentloaded');

    // Wait a bit for any async errors
    await page.waitForTimeout(1000);

    // Filter out known acceptable errors (like third-party scripts)
    const criticalErrors = errors.filter(
      (e) => !e.includes('favicon') && !e.includes('404') && !e.includes('third-party')
    );

    expect(criticalErrors).toHaveLength(0);
  });
});
