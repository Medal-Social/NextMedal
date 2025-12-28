'use server';

import type { QueryParams } from 'next-sanity';
import { fetchSanityLive, fetchSanityStatic } from './live';
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

// Site settings are static and should be cached
export async function getSite() {
  const site = await fetchSanityStatic<Sanity.Site>({
    query: SITE_QUERY,
    tags: ['site'],
  });

  if (!site)
    throw new Error(
      'Missing Site settings: 🫠 Your website might be having an identity crisis...\n\n' +
        'Solution: Publish the Site document in your Medal Social Studio.\n\n' +
        '💁‍♂️ https://www.medalsocial.com'
    );

  return site;
}
