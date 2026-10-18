import { expect, type Page, test } from '@playwright/test';

const HARNESS = '/dev/flipbook'; // default locale (en) is unprefixed
const counter = (page: Page) => page.getByTestId('fb-counter');
const settle = (page: Page) => page.waitForTimeout(1100);
const ready = (page: Page) =>
  expect(page.locator('.fb')).toHaveAttribute('data-complete', 'true', { timeout: 30_000 });

test.describe('Flipbook', () => {
  // One dev server compiles the harness on first hit; keep journeys serial and generous.
  test.describe.configure({ mode: 'serial', timeout: 90_000 });

  test('desktop: cover, keyboard, buttons, drag, click, zoom, thumbnails, fullscreen', async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile, 'desktop-only flow');
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(HARNESS, { waitUntil: 'domcontentloaded' });
    await ready(page);
    await expect(page.locator('.fb')).toHaveAttribute('data-orientation', 'landscape');
    await expect(counter(page)).toHaveText(/^1\s*\/\s*12$/);
    expect(
      await page.evaluate(() => [...document.scripts].some((s) => /page-flip|cdn\./.test(s.src)))
    ).toBe(false);

    await page.locator('.fb').focus();
    await page.keyboard.press('ArrowRight');
    await expect(counter(page)).toHaveText(/^2–3/);
    await page.locator('.fb-next').click();
    await expect(counter(page)).toHaveText(/^4–5/);

    const book = (await page.locator('.fb-book').boundingBox())!;
    await page.mouse.move(book.x + book.width - 20, book.y + book.height * 0.6);
    await page.mouse.down();
    await page.mouse.move(book.x + book.width * 0.3, book.y + book.height * 0.55, { steps: 16 });
    await page.mouse.up();
    await expect(counter(page)).toHaveText(/^6–7/);

    await page.mouse.move(book.x + book.width - 20, book.y + book.height * 0.5);
    await page.mouse.down();
    await page.mouse.move(book.x + book.width - 110, book.y + book.height * 0.5, { steps: 8 });
    await page.waitForTimeout(250);
    await page.mouse.up();
    await settle(page);
    await expect(counter(page)).toHaveText(/^6–7/);

    await page.mouse.click(book.x + book.width * 0.25, book.y + book.height * 0.5);
    await expect(counter(page)).toHaveText(/^4–5/);
    await page.mouse.dblclick(book.x + book.width * 0.6, book.y + book.height * 0.3); // middle zone: edges turn instantly
    await expect(page.locator('.fb')).toHaveClass(/is-zoomed/);
    await expect(counter(page)).toHaveText(/^4–5/);
    await page.keyboard.press('Escape');
    await expect(page.locator('.fb')).not.toHaveClass(/is-zoomed/);

    await page.keyboard.press('t');
    await page.getByRole('button', { name: 'Go to page 10' }).click();
    await expect(counter(page)).toHaveText(/^10–11/);
    await page.keyboard.press('Escape');
    await page.locator('.fb').focus();
    await page.keyboard.press('End');
    await expect(counter(page)).toHaveText(/^12\s*\//);
    await page.keyboard.press('Home');
    await expect(counter(page)).toHaveText(/^1\s*\//);
  });

  test('start page from props', async ({ page, isMobile }) => {
    test.skip(isMobile, 'desktop-only flow');
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`${HARNESS}?page=4`, { waitUntil: 'domcontentloaded' });
    await ready(page);
    await expect(counter(page)).toHaveText(/^4–5/);
  });

  test('mobile: single page, buttons both ways, swipe both ways, tap, double-tap zoom', async ({
    browser,
    browserName,
  }) => {
    test.skip(browserName !== 'chromium', 'touch swipes are injected over CDP (Chromium only)');
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
      isMobile: true,
      hasTouch: true,
      deviceScaleFactor: 3,
    });
    const page = await context.newPage();
    await page.goto(HARNESS, { waitUntil: 'domcontentloaded' });
    await ready(page);
    await expect(page.locator('.fb')).toHaveAttribute('data-orientation', 'portrait');
    await page.locator('.fb-step.next').tap();
    await expect(counter(page)).toHaveText(/^2\s*\//);
    await page.locator('.fb-step.prev').tap();
    await expect(counter(page)).toHaveText(/^1\s*\//);
    await page.locator('.fb-step.next').tap();
    await settle(page);

    const book = (await page.locator('.fb-book').boundingBox())!;
    const cdp = await context.newCDPSession(page);
    const y = book.y + book.height * 0.6;
    const swipe = async (fromX: number, toX: number) => {
      await cdp.send('Input.dispatchTouchEvent', {
        type: 'touchStart',
        touchPoints: [{ x: fromX, y }],
      });
      for (let k = 1; k <= 10; k++) {
        await cdp.send('Input.dispatchTouchEvent', {
          type: 'touchMove',
          touchPoints: [{ x: fromX + ((toX - fromX) * k) / 10, y }],
        });
      }
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
      await settle(page);
    };
    await swipe(book.x + book.width - 20, book.x + 20);
    await expect(counter(page)).toHaveText(/^3\s*\//);
    await swipe(book.x + 20, book.x + book.width - 20);
    await expect(counter(page)).toHaveText(/^2\s*\//);

    await page.touchscreen.tap(book.x + book.width * 0.8, book.y + book.height * 0.5);
    await expect(counter(page)).toHaveText(/^3\s*\//);
    await page.touchscreen.tap(book.x + book.width * 0.15, book.y + book.height * 0.5);
    await expect(counter(page)).toHaveText(/^2\s*\//);

    const fit = await page.evaluate(() => {
      const stage = document.querySelector('.fb-stage')!.getBoundingClientRect();
      const bookEl = document.querySelector('.fb-book')!.getBoundingClientRect();
      return stage.height - bookEl.height;
    });
    expect(fit).toBeLessThanOrEqual(48);

    await page.touchscreen.tap(book.x + book.width * 0.5, book.y + book.height * 0.25);
    await page.waitForTimeout(90);
    await page.touchscreen.tap(book.x + book.width * 0.5, book.y + book.height * 0.25);
    await expect(page.locator('.fb')).toHaveClass(/is-zoomed/);
    await expect(counter(page)).toHaveText(/^2\s*\//);
    await page.getByRole('button', { name: 'Close zoom' }).first().tap();
    await expect(page.locator('.fb')).not.toHaveClass(/is-zoomed/);
    await context.close();
  });

  test('arabic: right-to-left book turns with ArrowLeft', async ({ page, isMobile }) => {
    test.skip(isMobile, 'desktop-only flow');
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/ar/dev/flipbook', { waitUntil: 'domcontentloaded' });
    await ready(page);
    await expect(page.locator('.lf')).toHaveClass(/lf-rtl/);
    await page.locator('.fb').focus();
    await page.keyboard.press('ArrowLeft');
    await expect(counter(page)).toHaveText(/^2–3/);
  });
});
