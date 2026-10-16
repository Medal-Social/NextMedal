import assert from 'node:assert/strict';
import { test } from 'node:test';

const { loadOgFont } = await import('../../src/app/api/og/shared.ts');
const incoming = 'http://169.254.169.254:8080/api/og?title=untrusted';
const fontPath = '/fonts/Inter-SemiBold.ttf';

function configure(t, value) {
  const previous = process.env.NEXT_PUBLIC_BASE_URL;
  if (value === undefined) delete process.env.NEXT_PUBLIC_BASE_URL;
  else process.env.NEXT_PUBLIC_BASE_URL = value;
  t.after(() => {
    if (previous === undefined) delete process.env.NEXT_PUBLIC_BASE_URL;
    else process.env.NEXT_PUBLIC_BASE_URL = previous;
  });
}

test('font HTTP fetch uses configured origin and refuses redirects', async (t) => {
  configure(t, 'https://trusted.example');
  const fetch = t.mock.method(
    globalThis,
    'fetch',
    async () => new Response(new Uint8Array([1, 2]))
  );
  const loaded = await loadOgFont('Inter', fontPath, incoming);
  assert.equal(loaded.data.byteLength, 2);
  assert.equal(
    fetch.mock.calls[0].arguments[0],
    'https://trusted.example/fonts/Inter-SemiBold.ttf'
  );
  assert.equal(fetch.mock.calls[0].arguments[1].redirect, 'error');
  assert.ok(fetch.mock.calls[0].arguments[1].signal instanceof AbortSignal);
});

for (const origin of [
  undefined,
  'not a URL',
  'file:///etc/passwd',
  'https://user:pass@trusted.example',
]) {
  test(`font loading fails closed without a valid trusted HTTP origin: ${origin}`, async (t) => {
    configure(t, origin);
    const fetch = t.mock.method(globalThis, 'fetch', async () => new Response('font'));
    assert.equal(await loadOgFont('Inter', fontPath, incoming), null);
    assert.equal(fetch.mock.callCount(), 0);
  });
}

test('font loading rejects paths that escape the configured origin', async (t) => {
  configure(t, 'https://trusted.example');
  const fetch = t.mock.method(globalThis, 'fetch', async () => new Response('font'));
  assert.equal(await loadOgFont('Inter', '//attacker.example/font.ttf', incoming), null);
  assert.equal(fetch.mock.callCount(), 0);
});

test('font loading caps streamed data even without a content length', async (t) => {
  configure(t, 'https://trusted.example');
  let cancelled = false;
  let chunks = 0;
  t.mock.method(
    globalThis,
    'fetch',
    async () =>
      new Response(
        new ReadableStream({
          pull(controller) {
            if (chunks++ < 4) controller.enqueue(new Uint8Array(1024 * 1024));
            else controller.close();
          },
          cancel() {
            cancelled = true;
          },
        })
      )
  );
  assert.equal(await loadOgFont('Inter', fontPath, incoming), null);
  assert.equal(cancelled, true);
});
