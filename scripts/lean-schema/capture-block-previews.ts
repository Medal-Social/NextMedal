// Insert-menu grid previews (Vault spec 2026-10-18 §1, skill rule 5): one PNG
// per page block, captured read-only from the live site. Each run loads prod
// pages, so it counts as page views in the site's analytics.
// Usage: BASE_URL=https://www.nextmedal.com pnpm exec tsx scripts/lean-schema/capture-block-previews.ts [name …]
//
// flipbook has no instance on nextmedal.com. Its preview is shot from the
// dev-only harness /dev/flipbook (the real Flipbook component with the
// fixture PDF), so it needs `pnpm dev` running: LOCAL_URL (default
// http://localhost:3000). Pass block names to shoot only those.
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { chromium, type Locator, type Page } from '@playwright/test';
import sharp from 'sharp';

const base = process.env.BASE_URL ?? 'https://www.nextmedal.com';
const local = process.env.LOCAL_URL ?? 'http://localhost:3000';
const OUT = resolve(__dirname, '../../public/block-previews');
const WIDTH = 600;
const MAX_HEIGHT = 420;
/** Capture at 1440 wide; this tall a slice scales to 600 x 420. */
const VIEWPORT = { width: 1440, height: Math.round((MAX_HEIGHT * 1440) / WIDTH) };
/** No motion, no help-desk bubble (a shadow-DOM custom element), no cookie banner. */
const HIDE =
  '*{animation:none!important;transition:none!important}medal-helpdesk{display:none!important}';

/**
 * Screenshot the top of a block from inside the viewport (element screenshots
 * of tall blocks resize the page and drop pictures), then scale to 600 wide
 * and cut to 420 tall.
 */
async function shootBlock(page: Page, target: Locator, file: string) {
  await target.evaluate((el) =>
    window.scrollTo(0, window.scrollY + el.getBoundingClientRect().top)
  );
  await target.evaluate(async (root) => {
    const images = [...root.querySelectorAll('img')];
    for (const img of images) img.loading = 'eager';
    await Promise.all(images.map((img) => img.decode().catch(() => undefined)));
  });
  await page.waitForTimeout(1500);
  // The sticky header would sit on top of the block (a sticky block itself stays).
  await target.evaluate((root) => {
    for (const el of document.querySelectorAll<HTMLElement>('body *')) {
      if (el.contains(root) || root.contains(el)) continue;
      const { position } = getComputedStyle(el);
      if (position === 'fixed' || position === 'sticky') el.style.opacity = '0';
    }
  });
  const box = await target.boundingBox();
  if (!box) throw new Error(`${file}: block is not visible`);
  const shot = await page.screenshot({
    clip: {
      x: box.x,
      y: box.y,
      width: box.width,
      height: Math.min(box.height, VIEWPORT.height - box.y),
    },
  });
  const resized = await sharp(shot).resize({ width: WIDTH }).png().toBuffer();
  const { height = MAX_HEIGHT } = await sharp(resized).metadata();
  await sharp(resized)
    .extract({ left: 0, top: 0, width: WIDTH, height: Math.min(height, MAX_HEIGHT) })
    .toFile(file);
}

/** Where each block renders on the live site today; data-module is the stored _type. */
const SOURCES: Record<string, { path: string; selector: string; local?: boolean }> = {
  hero: { path: '/', selector: '[data-module="hero"]' },
  richtext: { path: '/features', selector: '[data-module="richtext"]' },
  callout: { path: '/', selector: '[data-module="callout"]' },
  'accordion-list': { path: '/', selector: '[data-module="accordion-list"]' },
  flipbook: { path: '/dev/flipbook', selector: 'main section', local: true },
  features: { path: '/', selector: '[data-module="features"]' },
  'product-comparison': { path: '/', selector: '[data-module="product-comparison"]' },
  'logo-cloud': { path: '/', selector: '[data-module="logo-cloud"]' },
  'pricing-list': { path: '/pricing', selector: '[data-module="pricing-list"]' },
  'articles-frontpage': { path: '/now', selector: '[data-module="articles-frontpage"]' },
  'changelog-frontpage': { path: '/changelog', selector: '[data-module="changelog-frontpage"]' },
  // The docs list renders its own layout without a data-module wrapper.
  'docs-frontpage': { path: '/docs', selector: 'main' },
  'events-frontpage': { path: '/events', selector: '[data-module="events-frontpage"]' },
  'newsletter-frontpage': { path: '/newsletter', selector: '[data-module="newsletter-frontpage"]' },
};

async function main() {
  mkdirSync(OUT, { recursive: true });
  const only = process.argv.slice(2);
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: VIEWPORT });
  for (const [name, source] of Object.entries(SOURCES)) {
    if (only.length && !only.includes(name)) continue;
    // load / networkidle never settle on some pages; wait for fonts and the block's pictures instead.
    await page.goto(`${source.local ? local : base}${source.path}`, {
      waitUntil: 'domcontentloaded',
    });
    await page.evaluate(() => document.fonts.ready.then(() => undefined));
    await page.addStyleTag({ content: HIDE });
    await shootBlock(page, page.locator(source.selector).first(), `${OUT}/${name}.png`);
    console.log('wrote', name);
  }
  await browser.close();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
