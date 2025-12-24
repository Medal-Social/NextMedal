import { createClient, groq } from "next-sanity";
import { projectId, dataset, apiVersion } from "./src/sanity/lib/project";
// import { token } from '@/lib/sanity/token'
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

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
    return await client.fetch(groq`*[_type == 'redirect']{
			'source': select(source match "/*" => source, "/" + source),
			'destination': select(
				destination.type == 'internal' =>
					select(
						destination.internal->._type == 'blog.post' => '/blog/',
						'/'
					) + destination.internal->.metadata.slug.current,
				destination.external
			),
			permanent
		}`);
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

export default withNextIntl(config);

