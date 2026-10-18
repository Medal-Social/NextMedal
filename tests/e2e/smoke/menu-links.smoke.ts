import { expect, test } from '@playwright/test';

/** Spec §4 link test: every header/footer link on the nb and ar pages answers 200. */
for (const home of ['/nb', '/ar']) {
  test(`${home}: every internal header and footer link answers 200`, async ({ page, request }) => {
    await page.goto(home);
    const hrefs = await page.$$eval('header a[href], footer a[href]', (links) =>
      links.map((a) => a.getAttribute('href') ?? '').filter((h) => h.startsWith('/'))
    );
    expect(hrefs.length).toBeGreaterThan(5);
    // Collect every failing link so one run lists them all.
    const failures: string[] = [];
    for (const href of [...new Set(hrefs)]) {
      const response = await request.get(href.split('#')[0]);
      if (response.status() !== 200) failures.push(`${response.status()} ${href}`);
    }
    expect(failures).toEqual([]);
  });
}
