import type { NextRequest } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

export function proxy(request: NextRequest) {
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
