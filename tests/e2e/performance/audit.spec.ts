import { expect, test } from '@playwright/test';
import { playAudit } from 'playwright-lighthouse';
import { getThresholdsForPage, lighthouseConfig } from './thresholds';

/**
 * Lighthouse Performance Audit Tests
 *
 * These tests run Lighthouse audits on key pages and verify they meet
 * the configured threshold scores for Performance, Accessibility,
 * Best Practices, and SEO.
 *
 * Requirements:
 * - Must run in headed Chromium with remote debugging enabled
 * - Use: pnpm lighthouse
 */

/**
 * Wait for page to be ready for Lighthouse audit.
 * Uses 'load' instead of 'networkidle' because Next.js dev server
 * maintains HMR connections that never reach networkidle state.
 */
async function waitForPageReady(page: import('@playwright/test').Page) {
  await page.waitForLoadState('load');
  // Small delay to ensure React hydration completes
  await page.waitForTimeout(1000);
}

const getReportConfig = (name: string) => ({
  formats: { html: true, json: true },
  name: name,
  directory: 'test-results/lighthouse',
});

test.describe('Lighthouse Audits', () => {
  // Skip on CI if not configured for Lighthouse
  test.skip(({ browserName }) => browserName !== 'chromium', 'Lighthouse requires Chromium');

  test.describe('Homepage', () => {
    test('English homepage meets Lighthouse thresholds', async ({ page }) => {
      await page.goto('/en');
      await waitForPageReady(page);

      const thresholds = getThresholdsForPage('/');

      const result = await playAudit({
        page,
        port: lighthouseConfig.port,
        thresholds: {
          performance: thresholds.performance,
          accessibility: thresholds.accessibility,
          'best-practices': thresholds['best-practices'],
          seo: thresholds.seo,
        },
        reports: getReportConfig('homepage-en'),
        config: {
          extends: 'lighthouse:default',
          settings: {
            ...lighthouseConfig.desktop,
            onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
          },
        },
      });

      // Assertions (playAudit throws if thresholds not met)
      expect(result).toBeDefined();
    });

    test('Norwegian homepage meets Lighthouse thresholds', async ({ page }) => {
      await page.goto('/nb');
      await waitForPageReady(page);

      const thresholds = getThresholdsForPage('/');

      const result = await playAudit({
        page,
        port: lighthouseConfig.port,
        thresholds: {
          performance: thresholds.performance,
          accessibility: thresholds.accessibility,
          'best-practices': thresholds['best-practices'],
          seo: thresholds.seo,
        },
        reports: getReportConfig('homepage-nb'),
        config: {
          extends: 'lighthouse:default',
          settings: {
            ...lighthouseConfig.desktop,
            onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
          },
        },
      });

      expect(result).toBeDefined();
    });
  });

  test.describe('Accessibility Focus', () => {
    test('homepage passes accessibility audit with high score', async ({ page }) => {
      await page.goto('/en');
      await waitForPageReady(page);

      const result = await playAudit({
        page,
        port: lighthouseConfig.port,
        thresholds: {
          accessibility: 100, // Perfect accessibility required
        },
        reports: getReportConfig('homepage-accessibility'),
        config: {
          extends: 'lighthouse:default',
          settings: {
            ...lighthouseConfig.desktop,
            onlyCategories: ['accessibility'],
          },
        },
      });

      expect(result).toBeDefined();
    });
  });

  test.describe('Performance Focus', () => {
    test('homepage has acceptable performance score', async ({ page }) => {
      await page.goto('/en');
      await waitForPageReady(page);

      const result = await playAudit({
        page,
        port: lighthouseConfig.port,
        thresholds: {
          performance: 90,
        },
        reports: getReportConfig('homepage-performance'),
        config: {
          extends: 'lighthouse:default',
          settings: {
            ...lighthouseConfig.desktop,
            onlyCategories: ['performance'],
          },
        },
      });

      expect(result).toBeDefined();
    });
  });

  test.describe('SEO Focus', () => {
    test('homepage has proper SEO setup', async ({ page }) => {
      await page.goto('/en');
      await waitForPageReady(page);

      const result = await playAudit({
        page,
        port: lighthouseConfig.port,
        thresholds: {
          seo: 100,
        },
        reports: getReportConfig('homepage-seo'),
        config: {
          extends: 'lighthouse:default',
          settings: {
            ...lighthouseConfig.desktop,
            onlyCategories: ['seo'],
          },
        },
      });

      expect(result).toBeDefined();
    });
  });

  test.describe('Best Practices Focus', () => {
    test('homepage follows web best practices', async ({ page }) => {
      await page.goto('/en');
      await waitForPageReady(page);

      const result = await playAudit({
        page,
        port: lighthouseConfig.port,
        thresholds: {
          'best-practices': 100,
        },
        reports: getReportConfig('homepage-best-practices'),
        config: {
          extends: 'lighthouse:default',
          settings: {
            ...lighthouseConfig.desktop,
            onlyCategories: ['best-practices'],
          },
        },
      });

      expect(result).toBeDefined();
    });
  });

  test.describe('Mobile Performance', () => {
    test('homepage performs well on mobile', async ({ page }) => {
      await page.goto('/en');
      await waitForPageReady(page);

      // Mobile has relaxed performance thresholds due to throttling
      const result = await playAudit({
        page,
        port: lighthouseConfig.port,
        thresholds: {
          performance: 60, // Mobile is slower
          accessibility: 90,
        },
        reports: getReportConfig('homepage-mobile'),
        config: {
          extends: 'lighthouse:default',
          settings: {
            ...lighthouseConfig.mobile,
            onlyCategories: ['performance', 'accessibility'],
          },
        },
      });

      expect(result).toBeDefined();
    });
  });
});

/**
 * Core Web Vitals specific tests
 * These check individual metrics rather than overall scores
 */
test.describe('Core Web Vitals', () => {
  test.skip(({ browserName }) => browserName !== 'chromium', 'Core Web Vitals require Chromium');

  test('homepage has good Largest Contentful Paint (LCP)', async ({ page }) => {
    await page.goto('/en');
    await waitForPageReady(page);

    // Use Performance API to measure LCP
    const lcp = await page.evaluate(() => {
      return new Promise<number>((resolve) => {
        let lcpValue = 0;

        const observer = new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          const lastEntry = entries[entries.length - 1];
          if (lastEntry) {
            lcpValue = lastEntry.startTime;
          }
        });

        observer.observe({ type: 'largest-contentful-paint', buffered: true });

        // Wait a bit then return the value
        setTimeout(() => {
          observer.disconnect();
          resolve(lcpValue);
        }, 3000);
      });
    });

    // LCP should be under 2.5 seconds for "good" rating
    expect(lcp).toBeLessThan(2500);
  });

  test('homepage has good Cumulative Layout Shift (CLS)', async ({ page }) => {
    await page.goto('/en');
    await waitForPageReady(page);

    // Measure CLS using Performance API
    const cls = await page.evaluate(() => {
      return new Promise<number>((resolve) => {
        let clsValue = 0;

        const observer = new PerformanceObserver((entryList) => {
          for (const entry of entryList.getEntries()) {
            // biome-ignore lint/suspicious/noExplicitAny: LayoutShiftEntry types not available in DOM lib
            const layoutEntry = entry as any;
            if (!layoutEntry.hadRecentInput) {
              clsValue += layoutEntry.value;
            }
          }
        });

        observer.observe({ type: 'layout-shift', buffered: true });

        // Wait for page to stabilize
        setTimeout(() => {
          observer.disconnect();
          resolve(clsValue);
        }, 3000);
      });
    });

    // CLS should be under 0.1 for "good" rating
    expect(cls).toBeLessThan(0.1);
  });
});
