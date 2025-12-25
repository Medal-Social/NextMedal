import { createClient, groq } from "next-sanity";
import { projectId, dataset, apiVersion } from "./src/sanity/lib/project";
// import { token } from '@/lib/sanity/token'
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import { withSentryConfig } from "@sentry/nextjs";

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
  // Configure image handling
  images: {
    dangerouslyAllowSVG: true,
    ...(process.env.NEXT_PUBLIC_IMAGE_PROXY_URL
      ? {
          loader: 'custom',
          loaderFile: './src/lib/image-loader.ts',
        }
      : {}),
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

  async redirects() {
    if (!client) {
      return [];
    }
    const cmsRedirects = await client.fetch(groq`*[_type == 'redirect']{
            'source': select(source match "/*" => source, "/" + source),
            'destination': select(
                destination.type == 'internal' => '/' + destination.internal->.metadata.slug.current,
                destination.external
            ),
            permanent
        }`);

    return [
      ...cmsRedirects,
      {
        source: '/blog/:slug',
        destination: '/:slug',
        permanent: true,
      },
    ];
  },

  experimental: {
    optimizePackageImports: [
      "@sanity/ui",
      "@sanity/icons",
      "framer-motion",
      "@base-ui/react",
    ],
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
