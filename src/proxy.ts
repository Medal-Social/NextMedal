import { createMiddleware, defaults as noseconeDefaults } from '@nosecone/next';

// Use the any type assertion to override type checking for this specific case
export default createMiddleware({
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
      ] as const,
      fontSrc: [...noseconeDefaults.contentSecurityPolicy.directives.fontSrc, "'self'"] as const,
      objectSrc: [...noseconeDefaults.contentSecurityPolicy.directives.objectSrc] as const,
      mediaSrc: [
        ...noseconeDefaults.contentSecurityPolicy.directives.mediaSrc,
        "'self'",
        'https://stream.mux.com',
        'https://www.youtube.com',
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
} as any);

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
