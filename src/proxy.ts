import {
  type NoseconeOptions,
  defaults as noseconeDefaults,
  createMiddleware as noseconeMiddleware,
} from '@nosecone/next';
import type { NextFetchEvent, NextProxy, ProxyConfig } from 'next/server';
import { NextRequest, NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

// Use the any type assertion to override type checking for this specific case
const noseconeOptions: NoseconeOptions = {
  contentSecurityPolicy: {
    ...noseconeDefaults.contentSecurityPolicy,
    directives: {
      ...noseconeDefaults.contentSecurityPolicy.directives,
      defaultSrc: [
        ...noseconeDefaults.contentSecurityPolicy.directives.defaultSrc,
        "'self'",
      ] as const,
      scriptSrc: [
        // We have to use unsafe-inline because next-themes
        //...noseconeDefaults.contentSecurityPolicy.directives.scriptSrc,
        "'self'",
        "'unsafe-inline'",
        // Only include unsafe-eval in non-production environments
        ...(process.env.NODE_ENV !== 'production' ? ["'unsafe-eval'"] : []),
        'https://www.youtube.com',
        'https://s.ytimg.com',
        'https://*.sanity.io',
        'https://analytics.medal.social',
        'blob:',
      ] as const,
      styleSrc: [...noseconeDefaults.contentSecurityPolicy.directives.styleSrc, "'self'"] as const,
      imgSrc: [
        ...noseconeDefaults.contentSecurityPolicy.directives.imgSrc,
        "'self'",
        'data:',
        'https://cdn.sanity.io',
        'https://image.mux.com',
        'https://i.ytimg.com',
        'https://img.youtube.com',
        'https://*.googleusercontent.com',
      ] as const,
      connectSrc: [
        ...noseconeDefaults.contentSecurityPolicy.directives.connectSrc,
        "'self'",
        'https://api.sanity.io',
        'https://*.api.sanity.io',
        'wss://api.sanity.io',
        'wss://*.api.sanity.io',
        'https://*.sanity.io',
        'https://cdn.sanity.io',
        'https://api.mux.com',
        'https://data.mux.com',
        'https://www.youtube.com',
        'https://youtube.googleapis.com',
        'https://analytics.medal.social',
      ] as const,
      fontSrc: [...noseconeDefaults.contentSecurityPolicy.directives.fontSrc, "'self'"] as const,
      objectSrc: [...noseconeDefaults.contentSecurityPolicy.directives.objectSrc] as const,
      mediaSrc: [
        ...noseconeDefaults.contentSecurityPolicy.directives.mediaSrc,
        "'self'",
        'https://stream.mux.com',
        'https://www.youtube.com',
        'blob:',
      ] as const,
      frameSrc: [
        "'self'",
        'https://www.youtube-nocookie.com',
        'https://www.youtube.com',
        'https://youtube.com',
        'https://*.sanity.io',
      ] as const,
      frameAncestors: ["'self'"] as const,
      formAction: [
        ...noseconeDefaults.contentSecurityPolicy.directives.formAction,
        "'self'",
      ] as const,
      workerSrc: [
        ...noseconeDefaults.contentSecurityPolicy.directives.workerSrc,
        "'self'",
        'blob:',
      ] as const,
      // We only set this in production because the server may be started
      // without HTTPS
      upgradeInsecureRequests: process.env.NODE_ENV === 'production',
    },
  },
  crossOriginResourcePolicy: {
    ...noseconeDefaults.crossOriginResourcePolicy,
    policy: 'cross-origin',
  },
  crossOriginEmbedderPolicy: {
    ...noseconeDefaults.crossOriginEmbedderPolicy,
    policy: 'unsafe-none',
  },
  crossOriginOpenerPolicy: {
    ...noseconeDefaults.crossOriginOpenerPolicy,
    policy: 'unsafe-none',
  },
} as any;

const securityHeaders = noseconeMiddleware(noseconeOptions);

// Chain multiple middleware functions together and propagate redirects/rewrites
function chain(middlewares: NextProxy[]): NextProxy {
  return async (request: NextRequest, event: NextFetchEvent) => {
    let response: NextResponse | Response | undefined;

    for (const proxy of middlewares) {
      const result = await proxy(request, event);

      if (result) {
        response = result;
        if (result instanceof NextResponse) {
          request = new NextRequest(result.url || request.url, {
            headers: result.headers,
          });
        }
      }
    }

    return response;
  };
}
const translationMiddleware = createMiddleware(routing);

export default chain([securityHeaders, translationMiddleware]);

export const config: ProxyConfig = {
  matcher: [
    '/((?!favicon\\.ico|block-previews|_next|api|studio|sitemap\\.xml|sitemap\\.xsl|robots\\.txt).*)',
  ],
};
