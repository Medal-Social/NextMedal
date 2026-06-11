import type { NextRequest } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

// Named `middleware.ts` (not `proxy.ts`) deliberately: Next 16's `proxy.ts` runs
// on the Node.js runtime, which the OpenNext Cloudflare adapter can't bundle yet
// ("Node.js middleware is not currently supported" — opennextjs-cloudflare#972).
// `middleware.ts` runs on the Edge runtime, which OpenNext supports and which
// next-intl's middleware targets natively, so it works across Cloudflare, Vercel,
// and other hosts. Revert to `proxy.ts` once OpenNext ships proxy support.
export default function middleware(request: NextRequest) {
  // Forward the pathname on the REQUEST so downstream Server Components
  // can read it via headers().get('x-pathname'). next-intl rebuilds its
  // rewrite/next response from `new Headers(request.headers)`, so the
  // x-pathname set here is forwarded to Server Components automatically —
  // no manual response rebuild is needed (and rebuilding it double-appended
  // next-intl's x-middleware-* directives, corrupting forwarded headers).
  request.headers.set('x-pathname', request.nextUrl.pathname);

  return intlMiddleware(request);
}

export const config = {
  matcher: [
    '/((?!favicon\\.ico|favicon\\.svg|icon\\.png|apple-icon\\.png|icons|block-previews|_next|api|studio|sitemap.*\\.xml|sitemap.*\\.xsl|rss\\.xsl|robots\\.txt|manifest\\.webmanifest|manifest\\.json|monitoring).*)',
  ],
};
