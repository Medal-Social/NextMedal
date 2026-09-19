import assert from 'node:assert/strict';
import { registerHooks } from 'node:module';
import { test } from 'node:test';

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier === './.open-next/worker.js') {
      return { url: new URL('./fixtures/open-next.mjs', import.meta.url).href, shortCircuit: true };
    }
    return nextResolve(specifier, context);
  },
});
const worker = (await import('../../cloudflare-worker.js')).default;

test('collection feeds pass through the Worker to OpenNext when static assets would miss', async () => {
  let assetLookups = 0;
  const env = {
    ASSETS: {
      fetch: () => {
        assetLookups++;
        return new Response(null, { status: 404 });
      },
    },
  };
  for (const path of ['/articles/rss.xml', '/nb/artikler/rss.xml']) {
    const response = await worker.fetch(new Request(`https://example.com${path}`), env, {});
    assert.equal(response.status, 200, path);
    assert.equal(response.headers.get('content-type'), 'application/rss+xml');
    assert.equal(await response.text(), '<rss>collection</rss>');
  }
  assert.equal(assetLookups, 0);
  for (const path of ['/missing.js', '/images/missing.png', '/articles/missing.xml']) {
    const response = await worker.fetch(new Request(`https://example.com${path}`), env, {});
    assert.equal(response.status, 404, path);
  }
  assert.equal(assetLookups, 3);
});

test('Worker blocks malformed and encoded sensitive paths before asset or application routing', async () => {
  const env = {
    ASSETS: {
      fetch() {
        throw new Error('blocked paths must not reach assets');
      },
    },
  };
  for (const url of [
    'not a URL',
    'https://example.com/%ZZ',
    'https://example.com/%252e%252e/private',
    'https://example.com/%252eenv',
    'https://example.com/%2egit/config',
  ]) {
    // Preserve the raw URL bytes: Request/WHATWG parsing can normalize traversal.
    const response = await worker.fetch({ url, method: 'GET' }, env, {});
    assert.equal(response.status, 404, url);
    assert.equal(await response.text(), 'Not found');
  }
});

test('Worker canonicalizes protocol, www and port while preserving path and query', async () => {
  const env = { NEXT_PUBLIC_BASE_URL: 'https://example.com' };
  for (const origin of [
    'http://example.com',
    'https://www.example.com',
    'https://example.com:8443',
  ]) {
    const response = await worker.fetch(new Request(`${origin}/articles?tag=one%20two`), env, {});
    assert.equal(response.status, 308, origin);
    assert.equal(response.headers.get('location'), 'https://example.com/articles?tag=one%20two');
  }
  const response = await worker.fetch(new Request('https://preview.example.net/articles'), env, {});
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('location'), null);
});

test('Worker preserves dotted CMS routes and delegates unknown documents to the app 404', async () => {
  const env = { ASSETS: { fetch: async () => new Response(null, { status: 404 }) } };
  for (const path of ['/contact.html', '/articles/release.xml', '/nb/report.json']) {
    const response = await worker.fetch(new Request(`https://example.com${path}`), env, {});
    assert.equal(response.status, 200, path);
    assert.equal(await response.text(), 'CMS document');
  }
  for (const path of ['/missing.html', '/articles/missing.xml', '/nb/missing.json']) {
    const response = await worker.fetch(new Request(`https://example.com${path}`), env, {});
    assert.equal(response.status, 404, path);
    assert.equal(await response.text(), 'CMS document not found');
  }
});

test('Worker passes the request-local OG deadline to OpenNext', async (t) => {
  const { ogRequests } = await import('./fixtures/open-next.mjs');
  t.mock.timers.enable({ apis: ['setTimeout'] });
  t.mock.method(console, 'error', () => {});
  const pending = worker.fetch(new Request('https://example.com/api/og/deadline-test'), {}, {});
  for (let attempt = 0; attempt < 100 && !ogRequests.length; attempt++) await Promise.resolve();
  assert.equal(ogRequests.length, 1);
  assert.equal(ogRequests[0].signal.aborted, false);
  t.mock.timers.tick(5000);
  assert.equal((await pending).status, 302);
  assert.equal(ogRequests[0].signal.aborted, true);
});
