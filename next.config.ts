import { createClient, groq } from "next-sanity";
import { projectId, dataset, apiVersion } from "./src/sanity/lib/project";
import { DEFAULT_LOCALE } from "./src/i18n/config";
import {
  COLLECTION_SLUGS_BY_LOCALE,
  DEFAULT_COLLECTION_SLUGS,
} from "./src/lib/collections/generated/collections.generated";
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
    // Cloudflare Workers can't run sharp, so disable Next's image optimizer on
    // the CF build and rely on Sanity's URL transforms (?w=&q=&fm=webp). Other
    // targets (Azure/Vercel) keep the optimizer.
    ...(process.env.CLOUDFLARE_BUILD ? { unoptimized: true } : {}),
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
    // On the Cloudflare build the embedded Sanity Studio is served from the
    // hosted Studio instead — the Studio bundle (all schemas + Studio plugins)
    // exceeds the Worker size limit, so the (studio) route excludes it there
    // (see src/app/(studio)/studio/[[...tool]]). Gated on CLOUDFLARE_BUILD so
    // Azure/Vercel keep the embedded Studio at /studio.
    const studioRedirects = process.env.CLOUDFLARE_BUILD
      ? [
          { source: '/studio', destination: 'https://nextmedal.sanity.studio', permanent: false },
          {
            source: '/studio/:path*',
            destination: 'https://nextmedal.sanity.studio/:path*',
            permanent: false,
          },
        ]
      : [];

    if (!client) {
      return studioRedirects;
    }

    const cmsRedirects = await client.fetch(groq`*[_type == 'redirect']{
            source,
            'destinationType': destination.type,
            'target': destination.internal->{
                _type,
                language,
                'slug': metadata.slug.current
            },
            'external': destination.external,
            permanent
        }`);

    type RedirectTarget = { _type?: string; language?: string; slug?: string | null };
    type CmsRedirect = {
      source?: string | null;
      destinationType?: 'internal' | 'external' | null;
      target?: RedirectTarget | null;
      external?: string | null;
      permanent?: boolean;
    };

    // Resolve an internal redirect target to a full path, including the locale
    // prefix and the collection path segment (e.g. /articles). Redirect targets
    // can be `collection.article` documents whose slug is only the final path
    // component, so a bare `/${slug}` would 404. Mirrors src/lib/sanity/resolve-url.
    const resolveInternalDestination = (target: RedirectTarget): string | null => {
      const slug = target.slug;
      if (!slug) return null;
      const language = target.language || DEFAULT_LOCALE;
      const localePrefix = language === DEFAULT_LOCALE ? '' : `/${language}`;
      if (slug === 'index') return localePrefix || '/';

      let collectionSegment = '';
      if (target._type?.startsWith('collection.')) {
        const collectionKey = target._type as keyof typeof DEFAULT_COLLECTION_SLUGS;
        const collectionSlug =
          COLLECTION_SLUGS_BY_LOCALE[language]?.[collectionKey]?.slug ||
          DEFAULT_COLLECTION_SLUGS[collectionKey];
        if (collectionSlug) collectionSegment = `/${collectionSlug}`;
      }
      return `${localePrefix}${collectionSegment}/${slug}`;
    };

    const cms = (cmsRedirects as CmsRedirect[])
      .map((r) => {
        const destination =
          r.destinationType === 'internal'
            ? r.target
              ? resolveInternalDestination(r.target)
              : null
            : (r.external ?? null);
        // Drop redirects with a missing source or destination. An internal
        // target that was deleted/unpublished yields a null destination, which
        // would otherwise make next.config throw and break every build.
        if (!r.source || !destination) return null;
        return {
          source: r.source.startsWith('/') ? r.source : `/${r.source}`,
          destination,
          permanent: Boolean(r.permanent),
        };
      })
      .filter(
        (r): r is { source: string; destination: string; permanent: boolean } => r !== null,
      );

    return [...studioRedirects, ...cms];
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
    // Inlined into the app bundle at build so the embedded-Studio dynamic import
    // in the (studio) route is dead-code-eliminated from the Cloudflare Worker.
    CLOUDFLARE_BUILD: process.env.CLOUDFLARE_BUILD ?? '',
  },

} satisfies NextConfig;

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

export default withNextIntl(config);
