import { createClient, groq } from "next-sanity";
import { projectId, dataset, apiVersion } from "./src/sanity/lib/project";
// import { token } from '@/lib/sanity/token'
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

// Allow the Umami analytics script origin (if configured) in the CSP — the
// script is injected client-side via next/script and would otherwise be
// blocked by script-src 'self', silently disabling analytics.
const umamiOrigin = (() => {
  const scriptUrl = process.env.NEXT_PUBLIC_UMAMI_SCRIPT_URL;
  if (!scriptUrl) return '';
  try {
    return ` ${new URL(scriptUrl).origin}`;
  } catch {
    return '';
  }
})();

// Custom headers for branding and security
const customHeaders = [
  { key: 'X-Powered-By', value: 'Medal Social' },
  {
    key: 'Content-Security-Policy',
    value: [
      // Social media embed iframe sources
      "frame-src 'self' platform.twitter.com www.linkedin.com www.instagram.com www.threads.net www.tiktok.com www.youtube.com;",
      // Script sources - 'unsafe-inline' needed for Next.js
      `script-src 'self' 'unsafe-inline'${umamiOrigin};`,
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
  // @medalsocial/sdk is loaded via dynamic import at runtime (workaround
  // for Turbopack's static-import tree-shaking bug). Marking it as a
  // server-external package ensures Next's standalone tracer copies the
  // module into .next/standalone so Docker images pick it up.
  serverExternalPackages: ['@medalsocial/sdk'],

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
            'destinationType': destination.type,
            'destination': select(
                destination.type == 'internal' => destination.internal->.metadata.slug.current,
                destination.external
            ),
            permanent
        }`);

    type CmsRedirect = {
      source?: string | null;
      destinationType?: 'internal' | 'external' | null;
      destination?: string | null;
      permanent?: boolean;
    };

    return (cmsRedirects as CmsRedirect[])
      .filter(
        // Drop redirects with a missing source or destination. An internal
        // target that was deleted/unpublished yields a null destination, which
        // would otherwise make next.config throw and break every build.
        (r): r is CmsRedirect & { source: string; destination: string } =>
          Boolean(r?.source) && Boolean(r?.destination),
      )
      .map((r) => {
        let destination = r.destination;
        if (r.destinationType === 'internal') {
          // Internal slugs are stored bare; "index" is the homepage root.
          destination = destination === 'index' ? '/' : `/${destination}`;
        }
        return {
          source: r.source.startsWith('/') ? r.source : `/${r.source}`,
          destination,
          permanent: Boolean(r.permanent),
        };
      });
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

export default withNextIntl(config);
