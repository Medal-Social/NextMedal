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
 * there is no binding, so HTTP fetches use the configured NEXT_PUBLIC_BASE_URL.
 *
 * Only the local ASSETS binding uses the incoming origin. HTTP loading fails
 * closed without a valid configured origin and never follows redirects.
 *
 * This module must stay dependency-free: the og routes import next/og
 * dynamically inside the request handler so that a module-load failure
 * degrades to the static card instead of a route-level 500, and that only
 * holds if nothing in this file can fail to load either.
 */
// Font files and the small OG logo are optional; never buffer an unbounded body.
const MAX_OG_ASSET_BYTES = 2 * 1024 * 1024;

async function readPublicAsset(
  publicPath: string,
  requestUrl: string
): Promise<ArrayBuffer | null> {
  const assets = assetsBinding();
  let reader: ReadableStreamDefaultReader<Uint8Array> | undefined;
  try {
    // ASSETS is a bound local store, so its URL cannot select an HTTP target.
    // Outside Workers only deployment configuration may choose the origin.
    const configuredOrigin = assets ? requestUrl : process.env.NEXT_PUBLIC_BASE_URL;
    if (!configuredOrigin) return null;
    const origin = new URL(configuredOrigin);
    if (!['http:', 'https:'].includes(origin.protocol) || origin.username || origin.password)
      return null;
    const url = new URL(publicPath, origin);
    if (url.origin !== origin.origin) return null;
    const response = assets
      ? await assets.fetch(url.href)
      : await fetch(url.href, { signal: AbortSignal.timeout(3000), redirect: 'error' });
    if (!response.ok) {
      void response.body?.cancel().catch(() => undefined);
      return null;
    }
    reader = response.body?.getReader();
    if (!reader) return null;
    const chunks: Uint8Array[] = [];
    let size = 0;
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_OG_ASSET_BYTES) {
        void reader.cancel().catch(() => undefined);
        return null;
      }
      chunks.push(value);
    }
    if (size === 0) return null;
    const data = new Uint8Array(size);
    let offset = 0;
    for (const chunk of chunks) {
      data.set(chunk, offset);
      offset += chunk.byteLength;
    }
    return data.buffer;
  } catch {
    void reader?.cancel().catch(() => undefined);
    return null;
  } finally {
    reader?.releaseLock();
  }
}

export async function loadOgFont(
  name: string,
  publicPath: string,
  requestUrl: string,
  weight: OgFont['weight'] = 600
): Promise<OgFont | null> {
  const data = await readPublicAsset(publicPath, requestUrl);
  return data ? { name, data, style: 'normal', weight } : null;
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
