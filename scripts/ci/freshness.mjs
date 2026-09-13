import assert from 'node:assert/strict';

export function assertBrowserFreshness(response) {
  const cache = response.headers.get('cache-control') || '';
  const directives = cache
    .toLowerCase()
    .split(',')
    .map((value) => value.trim());
  assert.ok(
    directives.includes('no-store') || directives.includes('no-cache'),
    `${response.url || 'Page'}: browser must revalidate HTML/RSC; got ${cache || '(missing)'}`
  );
}

export function assertDocumentRelease(html, expected) {
  if (!expected) return;
  const actual = /<html\b[^>]*\bdata-dpl-id="([^"]+)"/i.exec(html)?.[1];
  assert.equal(actual, expected, 'Homepage must be from the release just deployed');
}

export function referencedBuildAssets(html, baseUrl) {
  const urls = [...html.matchAll(/(?:src|href)="([^"<>]+)"/g)]
    .map((match) => {
      try {
        return new URL(match[1].replaceAll('&amp;', '&'), baseUrl);
      } catch {
        return null;
      }
    })
    .filter(
      (url) =>
        url && url.origin === new URL(baseUrl).origin && url.pathname.startsWith('/_next/static/')
    );
  return ['.js', '.css']
    .map((extension) => urls.find((url) => url.pathname.endsWith(extension))?.href)
    .filter(Boolean);
}

// Use ordinary URLs: a cache-busting query can hide stale release HTML.
// No login or mutation is performed; the cookie only exercises the anonymous
// returning-visitor path that bypasses our custom document caches.
export async function verifyFreshness(origin, expected, fetcher = fetch) {
  const get = async (url, headers = {}) => {
    const response = await fetcher(url, {
      signal: AbortSignal.timeout(20_000),
      headers: { 'User-Agent': 'Medal-Deployment-Smoke/1.0', ...headers },
    });
    assert.equal(response.status, 200, `${url}: expected HTTP 200`);
    return response;
  };
  const first = await get(new URL('/', origin));
  assert.ok(first.headers.get('content-type')?.includes('text/html'), 'Homepage must return HTML');
  const html = await first.text();
  assert.ok(/<html[\s>]/i.test(html), 'Homepage must contain HTML');
  assertBrowserFreshness(first);
  assertDocumentRelease(html, expected);
  const canonical = first.url || new URL('/', origin).href;
  const cookie =
    first.headers.get('set-cookie')?.match(/(?:^|,\s*)(NEXT_LOCALE=[^;,]+)/)?.[1] ||
    'medal_release_check=1';
  for (const headers of [{}, { Cookie: cookie }]) {
    const response = await get(canonical, headers);
    assertBrowserFreshness(response);
    assertDocumentRelease(await response.text(), expected);
  }

  const navigation = await get(canonical, {
    Cookie: cookie,
    RSC: '1',
    'Next-Url': new URL(canonical).pathname,
  });
  assert.ok(
    navigation.headers.get('content-type')?.includes('text/x-component'),
    'Navigation must return RSC, not cached HTML'
  );
  assertBrowserFreshness(navigation);
  if (expected)
    assert.equal(
      navigation.headers.get('x-nextjs-deployment-id'),
      expected,
      'Navigation release must match the deployed HTML'
    );
  await navigation.arrayBuffer();

  const assets = referencedBuildAssets(html, canonical);
  assert.equal(assets.length, 2, 'Homepage must reference versioned JavaScript and CSS');
  for (const url of assets) {
    const response = await get(url);
    assert.match(
      response.headers.get('cache-control') || '',
      /(?:^|,)\s*immutable\s*(?:,|$)/i,
      'Content-versioned build assets must retain immutable browser caching'
    );
    await response.arrayBuffer();
  }
}
