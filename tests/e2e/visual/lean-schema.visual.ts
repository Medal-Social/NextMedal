import { expect, type Page, test } from '@playwright/test';

/**
 * Full-site visual baseline for the lean-schema work (Vault plan 2026-10-18).
 * Captured from production BEFORE any change; staging must match it after,
 * apart from the owner-approved diffs.
 * Run: BASE_URL=https://www.nextmedal.com pnpm exec playwright test --project=visual tests/e2e/visual/lean-schema.visual.ts
 */
const PATHS = [
  '/',
  '/features',
  '/pricing',
  '/components',
  '/cookie-policy',
  '/privacy',
  '/terms-of-service',
  '/our-story',
  '/contact-us',
  '/now',
  '/changelog',
  '/docs',
  '/events',
  '/newsletter',
  '/this-page-does-not-exist',
  '/nb',
  '/nb/now',
  '/nb/endringslogg',
  '/nb/dokumentasjon',
  '/nb/hendelser',
  '/nb/nyhetsbrev',
  '/nb/privacy',
  '/ar',
  '/ar/now',
  '/ar/events',
  '/ar/newsletter',
  '/now/blogs-coming-soon',
  '/docs/button-component',
];

const WIDTHS = [390, 768, 1440];

// Overlays that are not part of this work (Step 2 confirms the selectors).
const HIDE = [
  '#cc-main',
  '[data-cookie-consent]',
  '[id*="medal-helpdesk"]:not(script)',
  'iframe[src*="helpdesk"]',
].join(',');

async function settle(page: Page) {
  // networkidle can hang on long-lived connections; fonts and images are awaited explicitly.
  await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => undefined);
  await page.addStyleTag({
    content: `*,*::before,*::after{animation:none!important;transition:none!important} ${HIDE}{display:none!important}`,
  });
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(400);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(200);
}

const shotName = (path: string, width: number) =>
  `${path === '/' ? 'home' : path.slice(1).replaceAll('/', '_')}-${width}.png`;

for (const width of WIDTHS) {
  test.describe(`lean-schema baseline @${width}`, () => {
    test.use({ viewport: { width, height: 900 } });
    for (const path of PATHS) {
      test(`${path} @${width}`, async ({ page }) => {
        await page.goto(path);
        await settle(page);
        await expect(page).toHaveScreenshot(shotName(path, width), {
          fullPage: true,
          maxDiffPixelRatio: 0.002,
        });
      });
    }
  });
}
