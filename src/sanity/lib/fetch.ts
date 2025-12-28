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

export async function getSite(stega?: boolean) {
  const site = await fetchSanity<Sanity.Site>({
    query: SITE_QUERY,
    stega,
  });

  if (!site)
    throw new Error(
      'Missing Site settings: 🫠 Your website might be having an identity crisis...\n\n' +
        'Solution: Publish the Site document in your Medal Social Studio.\n\n' +
        '💁‍♂️ https://www.medalsocial.com'
    );

  return site;
}
