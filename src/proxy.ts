import type { NextRequest } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

export function proxy(request: NextRequest) {
  const response = intlMiddleware(request);

  // Add pathname header for getCurrentPage() to reliably detect current path
  response.headers.set('x-pathname', request.nextUrl.pathname);

  return response;
}

export const config = {
  matcher: [
    '/((?!favicon\\.ico|favicon\\.svg|icon\\.png|apple-icon\\.png|icons|block-previews|_next|api|studio|sitemap.*\\.xml|sitemap.*\\.xsl|rss\\.xsl|robots\\.txt|manifest\\.webmanifest|manifest\\.json|monitoring).*)',
  ],
};
