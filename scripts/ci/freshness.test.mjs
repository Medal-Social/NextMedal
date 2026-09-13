import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  assertBrowserFreshness,
  assertDocumentRelease,
  referencedBuildAssets,
  verifyFreshness,
} from './freshness.mjs';

const html = (release = 'b') =>
  `<html data-dpl-id="${release}"><head><link href="/_next/static/style.css?dpl=${release}" rel="stylesheet"></head><body><script src="/_next/static/app.js?dpl=${release}"></script></body></html>`;
test('rejects old or missing release markers despite HTTP 200 HTML', () => {
  assert.throws(() => assertDocumentRelease(html('a'), 'b'));
  assert.throws(() => assertDocumentRelease('<html>old</html>', 'b'));
  assertDocumentRelease(html('b'), 'b');
});
test('rejects server-only cache directives and accepts browser validation or no-store', () => {
  for (const cache of ['', 's-maxage=31536000', 'public, max-age=60']) {
    assert.throws(() =>
      assertBrowserFreshness(new Response('', { headers: { 'cache-control': cache } }))
    );
  }
  for (const cache of ['private, no-cache, max-age=0, must-revalidate', 'private, no-store']) {
    assertBrowserFreshness(new Response('', { headers: { 'cache-control': cache } }));
  }
});
test('selects same-origin versioned assets and preserves deployment queries', () => {
  assert.deepEqual(referencedBuildAssets(html(), 'https://example.com'), [
    'https://example.com/_next/static/app.js?dpl=b',
    'https://example.com/_next/static/style.css?dpl=b',
  ]);
});

function fixture({
  staleCookie = false,
  staleNavigation = false,
  wrongNavigationType = false,
  mutableAssets = false,
} = {}) {
  const calls = [];
  const fetcher = (url, options) => {
    calls.push({ url: String(url), headers: options.headers });
    const headers = { 'cache-control': 'private, no-cache, max-age=0, must-revalidate' };
    if (String(url).includes('/_next/static/')) {
      return new Response('asset', {
        headers: {
          'cache-control': mutableAssets
            ? 'public, max-age=0'
            : 'public, max-age=31536000, immutable',
        },
      });
    }
    if (options.headers.RSC) {
      return new Response('flight', {
        headers: {
          ...headers,
          'content-type': wrongNavigationType ? 'text/html' : 'text/x-component',
          'x-nextjs-deployment-id': staleNavigation ? 'a' : 'b',
        },
      });
    }
    return new Response(html(staleCookie && options.headers.Cookie ? 'a' : 'b'), {
      headers: {
        ...headers,
        'content-type': 'text/html',
        'set-cookie': 'NEXT_LOCALE=nb; Path=/; SameSite=Lax',
      },
    });
  };
  return { calls, fetcher };
}
test('verifies ordinary, repeat, cookie, navigation and cached asset paths', async () => {
  const { calls, fetcher } = fixture();
  await verifyFreshness(new URL('https://example.com'), 'b', fetcher);
  assert.equal(calls.length, 6);
  assert.ok(calls.slice(0, 4).every((call) => call.url === 'https://example.com/'));
  assert.equal(calls[2].headers.Cookie, 'NEXT_LOCALE=nb');
  assert.equal(calls[3].headers.RSC, '1');
});
for (const broken of ['staleCookie', 'staleNavigation', 'wrongNavigationType', 'mutableAssets']) {
  test(`fails deployment when ${broken}`, async () => {
    await assert.rejects(
      verifyFreshness(new URL('https://example.com'), 'b', fixture({ [broken]: true }).fetcher)
    );
  });
}
