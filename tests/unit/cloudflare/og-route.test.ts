import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { relative, resolve } from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { loadOgFont, ogFallbackResponse } from '../../../src/app/api/og/shared';

/**
 * The invariants that decide whether a social share gets a preview image at
 * all. All three were broken in production across most of the fleet when this
 * was written (2026-08), and a link scraper caches whatever it got — so a
 * regression here stays invisible for as long as those caches live.
 */
const OG_DIR = resolve(process.cwd(), 'src/app/api/og');
const CF_CONTEXT = Symbol.for('__cloudflare-context__');

function ogRoutes(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = resolve(dir, entry.name);
    if (entry.isDirectory()) return ogRoutes(path);
    return entry.name === 'route.tsx' ? [relative(process.cwd(), path)] : [];
  });
}

const read = (route: string) => readFileSync(resolve(process.cwd(), route), 'utf8');

describe('og image routes', () => {
  const routes = ogRoutes(OG_DIR);

  it('has at least one og route to check', () => {
    expect(routes.length).toBeGreaterThan(0);
  });

  it.each(routes)('%s stays on the Node runtime', (route) => {
    // @opennextjs/cloudflare does not support the Next.js edge runtime: an
    // edge-runtime route answers every request on the deployed Worker with a
    // bare 500. next/og works fine on the default Node runtime.
    expect(read(route)).not.toMatch(/^\s*export\s+const\s+runtime\s*=/m);
  });

  it.each(routes)('%s degrades to the static card, never an error status', (route) => {
    expect(read(route)).toContain('ogFallbackResponse');
  });

  it('ships the static card the routes fall back to', () => {
    const card = resolve(process.cwd(), 'public/og-fallback.png');
    expect(existsSync(card)).toBe(true);
    expect(readFileSync(card).subarray(1, 4).toString()).toBe('PNG');
  });
});

describe('ogFallbackResponse', () => {
  it('redirects to the static card on the requesting origin', () => {
    const response = ogFallbackResponse('https://example.test/api/og?title=Hello');

    expect(response.status).toBe(302);
    expect(response.headers.get('Location')).toBe('https://example.test/og-fallback.png');
  });
});

describe('loadOgFont', () => {
  const font = new Uint8Array([0, 1, 0, 0]).buffer;

  afterEach(() => {
    delete (globalThis as Record<symbol, unknown>)[CF_CONTEXT];
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it('reads the font through the Worker ASSETS binding, not over HTTP', async () => {
    // A plain fetch of the site's own origin is a subrequest routed back into
    // this Worker rather than to the asset store, so it never returns a font.
    const assets = vi.fn().mockResolvedValue(new Response(font, { status: 200 }));
    const httpFetch = vi.fn();
    (globalThis as Record<symbol, unknown>)[CF_CONTEXT] = { env: { ASSETS: { fetch: assets } } };
    vi.stubGlobal('fetch', httpFetch);

    const loaded = await loadOgFont(
      'Inter',
      '/fonts/Inter-SemiBold.ttf',
      'https://site.test/api/og'
    );

    expect(assets).toHaveBeenCalledWith('https://site.test/fonts/Inter-SemiBold.ttf');
    expect(httpFetch).not.toHaveBeenCalled();
    expect(loaded).toMatchObject({ name: 'Inter', weight: 600 });
  });

  it('uses the configured origin for HTTP loading without a binding', async () => {
    vi.stubEnv('NEXT_PUBLIC_BASE_URL', 'http://localhost:3000');
    const httpFetch = vi.fn().mockResolvedValue(new Response(font, { status: 200 }));
    vi.stubGlobal('fetch', httpFetch);

    const loaded = await loadOgFont(
      'Inter',
      '/fonts/Inter-SemiBold.ttf',
      'http://localhost:3000/api/og'
    );

    expect(httpFetch).toHaveBeenCalledWith('http://localhost:3000/fonts/Inter-SemiBold.ttf', {
      signal: expect.any(AbortSignal),
      redirect: 'error',
    });
    expect(loaded?.data.byteLength).toBe(4);
  });

  it('returns null rather than throwing when every source fails', async () => {
    vi.stubEnv('NEXT_PUBLIC_BASE_URL', 'https://trusted.example');
    const httpFetch = vi.fn().mockRejectedValue(new Error('network down'));
    vi.stubGlobal('fetch', httpFetch);

    await expect(
      loadOgFont('Inter', '/fonts/Inter-SemiBold.ttf', 'https://site.test/api/og')
    ).resolves.toBeNull();
    expect(httpFetch).toHaveBeenCalledOnce();
  });
});
