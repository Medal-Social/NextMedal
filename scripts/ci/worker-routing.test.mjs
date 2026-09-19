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
