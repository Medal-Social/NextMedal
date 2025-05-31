import { createClient, groq } from "next-sanity";
import { projectId, dataset, apiVersion } from "@/sanity/lib/env";
// import { token } from '@/lib/sanity/token'
import type { NextConfig } from "next";
import { createMDX } from 'fumadocs-mdx/next';

const client = createClient({
  projectId,
  dataset,
  // token, // for private datasets
  apiVersion,
  useCdn: true,
});

const withMDX = createMDX();

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
    ],
  },
  compiler: {
    removeConsole: {
      exclude: ['error'],
    },
  },

  async redirects() {
    return await client.fetch(groq`*[_type == 'redirect']{
			source,
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

  async rewrites() {
    return [
      {
        source: '/docs',
        destination: '/docs',
      },
      {
        source: '/docs/:path*',
        destination: '/docs/:path*',
      }
    ];
  },

  env: {
    SC_DISABLE_SPEEDY: "false", // makes styled-components as fast in dev mode as it is in production mode
  },

} satisfies NextConfig;

export default withMDX(config);
