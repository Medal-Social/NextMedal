// NOTE: this file is named `middleware.ts` (the deprecated convention) instead of
// Next.js 16's preferred `proxy.ts`. Reason: @opennextjs/cloudflare does not yet
// support `proxy.ts` (which is forced to Node runtime in Next 16), and OpenNext
// for Cloudflare requires Edge-runtime middleware.
// See: https://github.com/opennextjs/opennextjs-cloudflare/issues/1213
//
// The locale handling is hand-rolled rather than next-intl's createMiddleware:
// next-intl's middleware throws "TypeError: Invalid URL string." at runtime
// under workerd (Cloudflare), failing every request — the same reason
// medalsocial-com replaced it. This reproduces next-intl's `as-needed`
// behavior with plain NextResponse APIs:
//   /            → internal rewrite to /<defaultLocale>          (the default locale serves unprefixed)
//   /en/...      → 308 redirect to the canonical unprefixed path
//   /nb/...      → pass through
// All branches forward `x-pathname` on the REQUEST headers so Server
// Components (getCurrentPage, locale switcher) can read the real path.

import { type NextRequest, NextResponse } from 'next/server';
import { routing } from '@/i18n/routing';

export default function middleware(request: NextRequest) {
  // Forward the pathname on the REQUEST so downstream Server Components
  // can read it via headers().get('x-pathname'). Setting it on the response
  // would leak the header to the browser while server code never sees it.
  request.headers.set('x-pathname', request.nextUrl.pathname);
  const forwardedRequest = { headers: request.headers };

  const firstSegment = request.nextUrl.pathname.split('/')[1];
  const hasLocalePrefix = routing.locales.includes(
    firstSegment as (typeof routing.locales)[number]
  );

  if (!hasLocalePrefix) {
    // Unprefixed path = default locale. Rewrite internally to the [locale]
    // tree, mirroring next-intl's `localePrefix: 'as-needed'` behavior.
    const pathname = request.nextUrl.pathname === '/' ? '' : request.nextUrl.pathname;
    const rewriteTarget = new URL(
      `/${routing.defaultLocale}${pathname}${request.nextUrl.search}`,
      request.url
    );
    const response = NextResponse.rewrite(rewriteTarget, { request: forwardedRequest });
    response.cookies.set('NEXT_LOCALE', routing.defaultLocale, { path: '/', sameSite: 'lax' });
    return response;
  }

  if (firstSegment === routing.defaultLocale) {
    // Explicit default-locale prefix → canonical unprefixed URL.
    const canonicalPath = request.nextUrl.pathname.replace(`/${routing.defaultLocale}`, '') || '/';
    const redirectTarget = new URL(`${canonicalPath}${request.nextUrl.search}`, request.url);
    return NextResponse.redirect(redirectTarget, 308);
  }

  const response = NextResponse.next({ request: forwardedRequest });
  response.cookies.set('NEXT_LOCALE', firstSegment, { path: '/', sameSite: 'lax' });
  return response;
}

export const config = {
  matcher: [
    '/((?!.*\\.(?:css|js|mjs|png|jpg|jpeg|gif|svg|webp|ico|txt|ttf|woff|woff2)$|icons|block-previews|_next|api|studio|sitemap.*\\.xml|sitemap.*\\.xsl|rss\\.xsl|robots\\.txt|manifest\\.webmanifest|manifest\\.json|monitoring).*)',
  ],
  runtime: 'experimental-edge',
};
