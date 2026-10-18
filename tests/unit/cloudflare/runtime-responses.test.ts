import { afterEach, describe, expect, it, vi } from 'vitest';
import { withOgFallback } from '../../../cloudflare/og-response.js';
import { servePublicFile } from '../../../cloudflare/public-files.js';

const req = (path: string) => new Request(`https://site.test${path}`);
afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('public file routing', () => {
  it.each(['/missing.js', '/favicon.ico', '/api', '/ads.txt'])(
    'returns a true 404 for %s',
    async (path) => {
      const response = await servePublicFile(req(path), {
        ASSETS: { fetch: async () => new Response(null, { status: 404 }) },
      });
      expect(response?.status).toBe(404);
    }
  );
  it('serves an existing public asset intact', async () => {
    const response = new Response('image', { headers: { 'Content-Type': 'image/png' } });
    expect(
      await servePublicFile(req('/icon.png'), { ASSETS: { fetch: async () => response } })
    ).toBe(response);
  });
  it.each([
    '/studio/static/editor.js',
    '/admin/index.html',
    '/%73tudio/index.html',
    '/studio%252findex.html',
    '/api/report.json',
    '/_next/image',
    '/robots.txt',
    '/sitemap-nb.xml',
    '/manifest.webmanifest',
    '/.well-known/acme-challenge/token',
    '/en/contact',
  ])('preserves owned routes and gates: %s', async (path) => {
    const fetch = vi.fn();
    expect(await servePublicFile(req(path), { ASSETS: { fetch } })).toBeNull();
    expect(fetch).not.toHaveBeenCalled();
  });
});

describe('complete OG responses', () => {
  const env = {
    ASSETS: {
      fetch: async () => new Response('brand card', { headers: { 'Content-Type': 'image/png' } }),
    },
  };
  it('preserves the rendered image bytes', async () => {
    const response = await withOgFallback(
      req('/api/og?title=hello'),
      env,
      async () => new Response('rendered', { headers: { 'Content-Type': 'image/png' } })
    );
    expect(await response.text()).toBe('rendered');
    expect(response.headers.get('X-OG-Fallback')).toBeNull();
  });
  it('catches errors that occur after the image response was constructed', async () => {
    const response = await withOgFallback(
      req('/api/og'),
      env,
      async () =>
        new Response(
          new ReadableStream({
            start(c) {
              c.error(new Error('renderer failed'));
            },
          })
        )
    );
    expect(response.status).toBe(200);
    expect(await response.text()).toBe('brand card');
    expect(response.headers.get('X-OG-Fallback')).toBe('1');
  });
  it('bounds a renderer that never settles', async () => {
    vi.useFakeTimers();
    const pending = withOgFallback(req('/api/og'), env, () => new Promise(() => {}), 100);
    await vi.advanceTimersByTimeAsync(100);
    expect(await (await pending).text()).toBe('brand card');
    expect(vi.getTimerCount()).toBe(0);
  });
  it('bounds a response stream that never finishes', async () => {
    vi.useFakeTimers();
    const cancel = vi.fn();
    const pending = withOgFallback(
      req('/api/og'),
      env,
      async () => new Response(new ReadableStream({ cancel })),
      100
    );
    await vi.advanceTimersByTimeAsync(100);
    expect((await pending).headers.get('X-OG-Fallback')).toBe('1');
    expect(cancel).toHaveBeenCalled();
  });
  it('does not consume normal streaming pages or form submissions', async () => {
    const response = new Response('page');
    expect(await withOgFallback(req('/contact'), env, async () => response)).toBe(response);
    expect(response.bodyUsed).toBe(false);
  });
});

describe('OG failure recovery', () => {
  it('redirects to the static card when the asset binding rejects', async () => {
    const response = await withOgFallback(
      req('/api/og'),
      {
        ASSETS: {
          fetch: async () => {
            throw new Error('asset service unavailable');
          },
        },
      },
      async () => {
        throw new Error('renderer unavailable');
      }
    );
    expect(response.status).toBe(302);
    expect(response.headers.get('location')).toBe('https://site.test/og-fallback.png');
  });
  it('aborts the request passed to the renderer when its deadline expires', async () => {
    vi.useFakeTimers();
    const aborted = vi.fn();
    const pending = withOgFallback(
      req('/api/og'),
      {},
      (renderRequest: Request) => {
        renderRequest?.signal.addEventListener('abort', aborted);
        return new Promise(() => {});
      },
      100
    );
    await vi.advanceTimersByTimeAsync(100);
    expect((await pending).status).toBe(302);
    expect(aborted).toHaveBeenCalledOnce();
  });
  it('cancels a response body that arrives after the rendering deadline', async () => {
    vi.useFakeTimers();
    const cancel = vi.fn();
    let complete!: (response: Response) => void;
    const pending = withOgFallback(
      req('/api/og'),
      {},
      () =>
        new Promise<Response>((resolve) => {
          complete = resolve;
        }),
      100
    );
    await vi.advanceTimersByTimeAsync(100);
    expect((await pending).status).toBe(302);
    complete(new Response(new ReadableStream({ cancel })));
    await vi.advanceTimersByTimeAsync(0);
    expect(cancel).toHaveBeenCalledOnce();
  });
  it('records renderer and asset failures without logging the request query', async () => {
    const log = vi.spyOn(console, 'error').mockImplementation(() => {});
    const renderError = new Error('renderer unavailable');
    const assetError = new Error('asset service unavailable');
    await withOgFallback(
      req('/api/og?title=private-user-title'),
      {
        ASSETS: {
          fetch: async () => {
            throw assetError;
          },
        },
      },
      async () => {
        throw renderError;
      }
    ).catch(() => {});
    expect(log).toHaveBeenCalledWith('[api/og] response failed', { phase: 'render' }, renderError);
    expect(log).toHaveBeenCalledWith('[api/og] fallback asset failed', assetError);
    expect(JSON.stringify(log.mock.calls)).not.toContain('private-user-title');
  });
});

describe('CMS document slugs', () => {
  it.each(['/contact.html', '/articles/release.xml', '/nb/report.json'])(
    'lets the application resolve %s after an asset miss',
    async (path) => {
      expect(
        await servePublicFile(req(path), {
          ASSETS: { fetch: async () => new Response(null, { status: 404 }) },
        })
      ).toBeNull();
    }
  );
});
