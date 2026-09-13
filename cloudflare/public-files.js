import { canonicalizeRequestPath } from './request-path-guard.js';

// Requests excluded from locale middleware must never fall into [locale].
// Existing public files are normally served by Workers Assets before this code;
// a miss still reaches the Worker and needs a real 404, not page rendering.
const FILE_EXTENSION =
  /\.(?:css|js|mjs|json|png|jpe?g|gif|svg|webp|avif|ico|txt|ttf|woff2?|map|html?|php|xml|xsl|webmanifest)$/i;
const DYNAMIC_FILE =
  /^\/(?:robots\.txt|manifest\.(?:json|webmanifest)|sitemap[^/]*\.(?:xml|xsl)|rss\.(?:xml|xsl)|feed\.(?:xml|json))$/;
const OWNED_PREFIX = /^\/(?:api|_next|studio|admin|\.well-known)(?:\/|$)/;

export async function servePublicFile(request, env) {
  const pathname = canonicalizeRequestPath(request);
  if (pathname === null) return null;
  if (
    pathname !== '/api' &&
    (OWNED_PREFIX.test(pathname) || DYNAMIC_FILE.test(pathname) || !FILE_EXTENSION.test(pathname))
  )
    return null;
  if (env?.ASSETS && (request.method === 'GET' || request.method === 'HEAD')) {
    const response = await env.ASSETS.fetch(request);
    if (response.status !== 404) return response;
  }
  return new Response(request.method === 'HEAD' ? null : 'Not found', {
    status: 404,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=300',
    },
  });
}
