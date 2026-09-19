export type OgFont = {
  name: string;
  data: ArrayBuffer;
  style?: 'normal' | 'italic';
  weight?: 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
};

type AssetsBinding = { fetch: (input: string | Request) => Promise<Response> };

/**
 * The Worker's static-asset binding, or undefined when we're not on Workers.
 *
 * opennextjs-cloudflare stashes the Worker `env` on a well-known global symbol
 * (the same one lib/core/env reads), so we can reach the binding without
 * importing the adapter — see the dependency note on loadOgFont below.
 */
function assetsBinding(): AssetsBinding | undefined {
  if (typeof globalThis === 'undefined') return undefined;
  const ctx = (globalThis as { [k: symbol]: { env?: { ASSETS?: AssetsBinding } } | undefined })[
    Symbol.for('__cloudflare-context__')
  ];
  return ctx?.env?.ASSETS;
}

/**
 * Load a font for satori/ImageResponse from the app's own /public directory.
 *
 * On Cloudflare Workers this MUST go through the ASSETS binding. A plain
 * fetch() of the site's own https:// origin is a subrequest routed back into
 * this Worker rather than to the asset store, so it never returns the font —
 * which is why the og cards rendered without one in production. The binding
 * reads the asset directly, with no network hop. Off Workers (next dev, tests)
 * there is no binding and the plain fetch is the correct path.
 *
 * The origin comes from the request rather than from BASE_URL so this works
 * even when env hydration hasn't happened yet.
 *
 * This module must stay dependency-free: the og routes import next/og
 * dynamically inside the request handler so that a module-load failure
 * degrades to the static card instead of a route-level 500, and that only
 * holds if nothing in this file can fail to load either.
 */
export async function loadOgFont(
  name: string,
  publicPath: string,
  requestUrl: string,
  weight: OgFont['weight'] = 600
): Promise<OgFont | null> {
  const url = new URL(publicPath, requestUrl).toString();
  const assets = assetsBinding();

  for (const read of [
    assets ? () => assets.fetch(url) : () => fetch(url, { signal: AbortSignal.timeout(3000) }),
  ]) {
    if (!read) continue;
    try {
      const res = await read();
      if (!res.ok) continue;
      const data = await res.arrayBuffer();
      if (data.byteLength > 0) return { name, data, style: 'normal', weight };
    } catch {
      // Try the next source.
    }
  }
  return null;
}

/**
 * Never answer an og:image request with an error status: link scrapers cache
 * the failure and the share renders with no image at all. Redirect to the
 * static brand card instead. Derived from the request URL, never from env —
 * this must work even when everything else failed to load.
 */
export function ogFallbackResponse(requestUrl: string): Response {
  return Response.redirect(new URL('/og-fallback.png', requestUrl).toString(), 302);
}
