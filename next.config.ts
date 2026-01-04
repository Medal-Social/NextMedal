import { createClient, groq } from "next-sanity";
import { projectId, dataset, apiVersion } from "./src/sanity/lib/project";
// import { token } from '@/lib/sanity/token'
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import { withSentryConfig } from "@sentry/nextjs";

// Custom headers for branding and security
const customHeaders = [
  { key: 'X-Powered-By', value: 'Medal Social' },
  {
    key: 'Content-Security-Policy',
    value: [
      // Social media embed iframe sources
      "frame-src 'self' platform.twitter.com www.linkedin.com www.instagram.com www.threads.net www.tiktok.com www.youtube.com;",
      // Script sources - 'unsafe-inline' needed for Next.js
      "script-src 'self' 'unsafe-inline';",
    ].join(' '),
  },
];

const client = projectId
  ? createClient({
      projectId,
      dataset,
      // token, // for private datasets
      apiVersion,
      useCdn: true,
    })
  : null;

const config = {
  reactStrictMode: true,
  poweredByHeader: false,
  output: "standalone",

  // Next.js 16 optimizations
  reactCompiler: true,
  // cacheComponents: true, // Disabled until stable - causes "Element type undefined" during prerendering

  // Long cache life since SanityLive handles on-demand revalidation
  // See: https://github.com/sanity-io/next-sanity/blob/main/packages/next-sanity/EXPERIMENTAL-CACHE-COMPONENTS.md
  cacheLife: {
    default: {
      revalidate: 60 * 60 * 24 * 90, // 90 days - SanityLive handles revalidation
    },
  },

  // Configure image handling
  images: {
    dangerouslyAllowSVG: true,
    ...(process.env.NEXT_PUBLIC_IMAGE_PROXY_URL
      ? {
          loader: 'custom',
          loaderFile: './src/lib/image-loader.ts',
        }
      : {}),
    localPatterns: [
      {
        pathname: '/api/og/**',
      },
    ],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
      },
      {
        protocol: "https",
        hostname: "image.mux.com",
      },
      {
        protocol: "https",
        hostname: "img.youtube.com",
      },
    ],
  },
  compiler: {
    removeConsole: {
      exclude: ['error'],
    },
  },

  async headers() {
    return [{ source: '/:path*', headers: customHeaders }];
  },

  async redirects() {
    if (!client) {
      return [];
    }

    const cmsRedirects = await client.fetch(groq`*[_type == 'redirect']{
            source,
            'destination': select(
                destination.type == 'internal' => '/' + destination.internal->.metadata.slug.current,
                destination.external
            ),
            permanent
        }`);

    // Auto-fix: Add leading "/" if missing (assume root level)
    return cmsRedirects.map(
      (r: { source: string; destination: string; permanent: boolean }) => ({
        ...r,
        source: r.source.startsWith('/') ? r.source : `/${r.source}`,
      }),
    );
  },

  // Rewrite sitemap URLs to use internal dynamic route
  // External: /sitemap-en.xml → Internal: /sitemap/en
  async rewrites() {
    return [
      {
        source: '/sitemap-:locale.xml',
        destination: '/sitemap/:locale',
      },
    ];
  },

  env: {
    SC_DISABLE_SPEEDY: "false", // makes styled-components as fast in dev mode as it is in production mode
  },

} satisfies NextConfig;

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const sentryConfig = withSentryConfig(withNextIntl(config), {
  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/#configure-vercel-project-settings

  // Suppresses source map uploading logs during bundling
  silent: true,
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Routes browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers (increases server load)
  tunnelRoute: "/monitoring",

  // Hides source maps from visitors
  sourcemaps: {
    deleteSourcemapsAfterUpload: true,
  },

  // Automatically tree-shake Sentry logger statements to reduce bundle size
  // and enables automatic instrumentation of Vercel Cron Monitors.
  webpack: {
    treeshake: {
      removeDebugLogging: true,
    },
    automaticVercelMonitors: true,
  },
});

export default sentryConfig;
