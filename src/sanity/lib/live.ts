import type { QueryParams } from 'next-sanity';
import { defineLive } from 'next-sanity/live';
import { client } from '@/sanity/lib/client';
import { token } from '@/sanity/lib/token';

// Browser token for client-side live updates (NEXT_PUBLIC_ prefix exposes it to browser)
// Only pass browserToken if it's actually set to avoid connection errors
const browserToken = process.env.NEXT_PUBLIC_SANITY_BROWSER_TOKEN || undefined;

export const { sanityFetch, SanityLive } = defineLive({
  client,
  serverToken: token,
  // When browserToken is undefined, SanityLive will skip client-side live connections
  ...(browserToken ? { browserToken } : {}),
  fetchOptions: {
    revalidate: 60 * 60 * 24 * 90, // 90 days - SanityLive handles on-demand revalidation
  },
});

// Wrapper around sanityFetch that returns just the data
// sanityFetch from defineLive automatically handles draft mode detection
export async function fetchSanityLive<T = unknown>(
  args: Parameters<typeof sanityFetch>[0] & { stega?: boolean }
) {
  const { data } = await sanityFetch({
    ...args,
    stega: args.stega ?? undefined,
  });

  return data as T;
}

// Fetch for static content (site settings, navigation, etc.)
// Uses CDN for optimal performance
export async function fetchSanityStatic<T = unknown>(args: {
  query: string;
  params?: Partial<QueryParams>;
  tags?: string[];
}) {
  const data = await client
    .withConfig({
      useCdn: true,
      perspective: 'published',
      stega: false,
      token,
    })
    .fetch<T>(args.query, args.params ?? {});

  return data;
}
