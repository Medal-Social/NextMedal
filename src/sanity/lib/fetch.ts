'use server';

import type { QueryParams } from 'next-sanity';
import { fetchSanityLive } from './live';
import { SITE_QUERY } from './queries';
export { fetchSanityLive };

export async function fetchSanity<T = unknown>({
  query,
  params = {},
  tags,
  stega,
}: {
  query: string;
  params?: Partial<QueryParams>;
  tags?: string[];
  stega?: boolean;
}) {
  return fetchSanityLive<T>({ query, params, tags, stega });
}

// Site settings - uses fetchSanityLive for SanityLive revalidation support
export async function getSite() {
  const site = await fetchSanityLive<Sanity.Site>({
    query: SITE_QUERY,
  });

  if (!site)
    throw new Error(
      'Missing Site settings: 🫠 Your website might be having an identity crisis...\n\n' +
        'Solution: Publish the Site document in your Medal Social Studio.\n\n' +
        '💁‍♂️ https://www.medalsocial.com'
    );

  return site;
}

// Optional site settings - returns null instead of throwing when site is missing
// Useful for setup/onboarding flows where we want to handle missing site gracefully
export async function getSiteOptional() {
  const site = await fetchSanityLive<Sanity.Site>({
    query: SITE_QUERY,
  });

  return site ?? null;
}
