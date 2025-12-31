import { test as base, type Page } from '@playwright/test';

/**
 * Custom test fixtures for NextMedal E2E tests
 * Provides helpers for common operations like draft mode and locale switching
 */

export interface TestFixtures {
  /** Navigate to a page with draft mode enabled */
  enableDraftMode: (path?: string) => Promise<void>;
  /** Navigate to a page with a specific locale */
  navigateWithLocale: (path: string, locale: 'en' | 'nb') => Promise<void>;
  /** Wait for the page to be fully loaded and hydrated */
  waitForHydration: () => Promise<void>;
}

export const test = base.extend<TestFixtures>({
  /**
   * Enable draft mode by visiting the draft mode enable endpoint
   * Then navigate to the specified path (or homepage)
   */
  enableDraftMode: async ({ page }, use) => {
    const enableDraftMode = async (path = '/en') => {
      // Enable draft mode via the API endpoint
      await page.goto(`/api/draft-mode/enable?slug=${path}`);
      // Should redirect to the page with draft mode cookie set
      await page.waitForURL(path);
    };
    await use(enableDraftMode);
  },

  /**
   * Navigate to a page with a specific locale prefix
   */
  navigateWithLocale: async ({ page }, use) => {
    const navigateWithLocale = async (path: string, locale: 'en' | 'nb') => {
      const localizedPath = path.startsWith('/') ? `/${locale}${path}` : `/${locale}/${path}`;
      await page.goto(localizedPath);
      await page.waitForLoadState('networkidle');
    };
    await use(navigateWithLocale);
  },

  /**
   * Wait for Next.js hydration to complete
   * Useful for ensuring client-side components are ready
   */
  waitForHydration: async ({ page }, use) => {
    const waitForHydration = async () => {
      // Wait for Next.js to finish hydrating
      // The __NEXT_DATA__ script is present after SSR, and React attaches event listeners after hydration
      await page.waitForFunction(() => {
        // Check if document is fully loaded
        if (document.readyState !== 'complete') return false;
        // Check for any loading indicators
        const loadingIndicators = document.querySelectorAll('[data-loading="true"]');
        return loadingIndicators.length === 0;
      });
      // Additional small wait for any async client-side operations
      await page.waitForTimeout(100);
    };
    await use(waitForHydration);
  },
});

export { expect } from '@playwright/test';

/**
 * Common test helpers
 */
export const helpers = {
  /**
   * Check if an element is visible and not covered by other elements
   */
  async isElementAccessible(page: Page, selector: string): Promise<boolean> {
    const element = page.locator(selector);
    const isVisible = await element.isVisible();
    if (!isVisible) return false;

    // Check if element is not covered by other elements
    const box = await element.boundingBox();
    if (!box) return false;

    const centerX = box.x + box.width / 2;
    const centerY = box.y + box.height / 2;

    const elementAtPoint = await page.evaluate(
      ({ x, y }) => {
        const el = document.elementFromPoint(x, y);
        return el?.closest(selector) !== null;
      },
      { x: centerX, y: centerY, selector }
    );

    return elementAtPoint;
  },

  /**
   * Get all focusable elements on the page
   */
  async getFocusableElements(page: Page) {
    return page.locator(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
  },

  /**
   * Tab through elements and return the focus order
   */
  async getTabOrder(page: Page, maxTabs = 20): Promise<string[]> {
    const focusOrder: string[] = [];
    for (let i = 0; i < maxTabs; i++) {
      await page.keyboard.press('Tab');
      const focusedElement = await page.evaluate(() => {
        const el = document.activeElement;
        if (!el || el === document.body) return null;
        return (
          el.tagName.toLowerCase() +
          (el.id ? `#${el.id}` : '') +
          (el.className ? `.${el.className.split(' ').join('.')}` : '')
        );
      });
      if (!focusedElement) break;
      focusOrder.push(focusedElement);
    }
    return focusOrder;
  },
};
