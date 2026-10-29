import 'server-only';
import type { QueryParams } from 'next-sanity';
import { defineLive } from 'next-sanity/live';
import { withRetry } from '@/lib/utils';
import { client } from '@/sanity/lib/client';
import { token } from '@/sanity/lib/token';

// Published live updates revalidate through next-sanity's server action.
// Draft mode and visual editing read `token` on the server. `browserToken`
// stays false so the Viewer token is never sent to the browser.
export const { sanityFetch, SanityLive } = defineLive({
  client,
  serverToken: token,
  browserToken: false,
});

// Wrapper around sanityFetch that returns just the data
// sanityFetch from defineLive automatically handles draft mode detection
// Includes retry logic for transient network failures
export async function fetchSanityLive<T = unknown>(
  args: Parameters<typeof sanityFetch>[0] & { stega?: boolean }
) {
  const { data } = await withRetry(
    () =>
      sanityFetch({
        ...args,
        stega: args.stega ?? undefined,
      }),
    { retries: 3, delay: 1000 }
  );

  return data as T;
}

// Fetch for static content (site settings, navigation, etc.)
// Uses CDN for optimal performance
// Includes retry logic for transient network failures
export async function fetchSanityStatic<T = unknown>(args: {
  query: string;
  params?: Partial<QueryParams>;
  tags?: string[];
}) {
  const data = await withRetry(
    () =>
      client
        .withConfig({
          useCdn: true,
          perspective: 'published',
          stega: false,
          token,
        })
        .fetch<T>(args.query, args.params ?? {}),
    { retries: 3, delay: 1000 }
  );

  return data;
}
