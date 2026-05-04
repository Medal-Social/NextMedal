import { type NextRequest, NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

export function proxy(request: NextRequest) {
  // Forward the pathname on the REQUEST so downstream Server Components
  // can read it via headers().get('x-pathname'). The previous implementation
  // set this on the response, where Server Components never see it.
  request.headers.set('x-pathname', request.nextUrl.pathname);

  const response = intlMiddleware(request);

  // Pass through redirects unchanged — they don't render Server Components.
  if (response.headers.get('location')) return response;

  // Re-emit so the forwarded request headers reach the downstream handler.
  const rewriteUrl = response.headers.get('x-middleware-rewrite');
  const forwardedRequest = { headers: request.headers };
  const rebuilt = rewriteUrl
    ? NextResponse.rewrite(rewriteUrl, { request: forwardedRequest })
    : NextResponse.next({ request: forwardedRequest });

  // Preserve every response header next-intl set (locale cookie, etc.)
  // except the rewrite directive, which we've already consumed.
  response.headers.forEach((value, key) => {
    if (key !== 'x-middleware-rewrite') rebuilt.headers.set(key, value);
  });

  return rebuilt;
}

export const config = {
  matcher: [
    '/((?!favicon\\.ico|favicon\\.svg|icon\\.png|apple-icon\\.png|icons|block-previews|_next|api|studio|sitemap.*\\.xml|sitemap.*\\.xsl|rss\\.xsl|robots\\.txt|manifest\\.webmanifest|manifest\\.json|monitoring).*)',
  ],
};
