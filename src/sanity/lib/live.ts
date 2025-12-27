import { draftMode } from 'next/headers';
import { defineLive } from 'next-sanity/live';
import { dev, env } from '@/lib/env';
import { client } from '@/sanity/lib/client';
import { token } from '@/sanity/lib/token';

export const { sanityFetch, SanityLive } = defineLive({
  client,
  serverToken: token,
  browserToken: env.SANITY_API_BROWSER_TOKEN,
});

export async function fetchSanityLive<T = unknown>(
  args: Parameters<typeof sanityFetch>[0] & { stega?: boolean }
) {
  const preview = dev || (await draftMode()).isEnabled;

  const { data } = await sanityFetch({
    ...args,
    perspective: args.perspective || (preview ? 'drafts' : 'published'),
    stega: args.stega ?? undefined,
  });

  return data as T;
}
