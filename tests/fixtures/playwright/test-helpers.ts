import type { Page } from '@playwright/test';

/**
 * Viewport sizes for responsive testing
 */
export const viewports = {
  mobile: { width: 375, height: 667 },
  tablet: { width: 768, height: 1024 },
  desktop: { width: 1280, height: 800 },
  wide: { width: 1920, height: 1080 },
} as const;

/**
 * Supported locales
 */
export const locales = ['en', 'nb'] as const;
export type Locale = (typeof locales)[number];

/**
 * Wait for a specific amount of time (use sparingly)
 */
export async function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Check if an element is in the viewport
 */
export async function isInViewport(page: Page, selector: string): Promise<boolean> {
  return page.evaluate((sel) => {
    const element = document.querySelector(sel);
    if (!element) return false;

    const rect = element.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  }, selector);
}

/**
 * Get computed styles for an element
 */
export async function getComputedStyles(
  page: Page,
  selector: string,
  properties: string[]
): Promise<Record<string, string>> {
  return page.evaluate(
    ({ sel, props }) => {
      const element = document.querySelector(sel);
      if (!element) return {};

      const styles = window.getComputedStyle(element);
      const result: Record<string, string> = {};
      for (const prop of props) {
        result[prop] = styles.getPropertyValue(prop);
      }
      return result;
    },
    { sel: selector, props: properties }
  );
}

/**
 * Check if an element is covered by another element
 */
export async function isElementCovered(page: Page, selector: string): Promise<boolean> {
  return page.evaluate((sel) => {
    const element = document.querySelector(sel);
    if (!element) return true;

    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const topElement = document.elementFromPoint(centerX, centerY);
    return topElement !== element && !element.contains(topElement);
  }, selector);
}

/**
 * Get all ARIA attributes from an element
 */
export async function getAriaAttributes(
  page: Page,
  selector: string
): Promise<Record<string, string>> {
  return page.evaluate((sel) => {
    const element = document.querySelector(sel);
    if (!element) return {};

    const result: Record<string, string> = {};
    const attributes = element.attributes;

    for (let i = 0; i < attributes.length; i++) {
      const attr = attributes[i];
      if (attr?.name.startsWith('aria-') || attr?.name === 'role') {
        result[attr.name] = attr.value;
      }
    }

    return result;
  }, selector);
}

/**
 * Scroll to an element and wait for it to be stable
 */
export async function scrollToElement(page: Page, selector: string): Promise<void> {
  await page.locator(selector).scrollIntoViewIfNeeded();
  await page.waitForTimeout(100); // Wait for scroll to complete
}

/**
 * Get the z-index of an element
 */
export async function getZIndex(page: Page, selector: string): Promise<number> {
  return page.evaluate((sel) => {
    const element = document.querySelector(sel);
    if (!element) return 0;

    const zIndex = window.getComputedStyle(element).zIndex;
    return zIndex === 'auto' ? 0 : parseInt(zIndex, 10);
  }, selector);
}

/**
 * Check if page has any console errors
 */
export async function collectConsoleErrors(page: Page): Promise<string[]> {
  const errors: string[] = [];

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });

  return errors;
}

/**
 * Take a screenshot with a descriptive name
 */
export async function takeNamedScreenshot(
  page: Page,
  name: string,
  fullPage = false
): Promise<void> {
  await page.screenshot({
    path: `test-results/screenshots/${name}.png`,
    fullPage,
  });
}
