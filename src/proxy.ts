import type { NextRequest } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

export function proxy(request: NextRequest) {
  // Run i18n middleware to handle redirects/rewrites
  return intlMiddleware(request);
}

export const config = {
  matcher: [
    '/((?!favicon\\.ico|block-previews|_next|api|studio|sitemap\\.xml|sitemap\\.xsl|robots\\.txt|manifest\\.webmanifest|manifest\\.json|monitoring).*)',
  ],
};
