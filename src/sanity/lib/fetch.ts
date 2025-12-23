'use server';

import { draftMode } from 'next/headers';
import type { QueryOptions, QueryParams } from 'next-sanity';
import { groq } from 'next-sanity';
import { dev } from '@/lib/env';
import { client } from '@/sanity/lib/client';
import { fetchSanityLive } from './live';
export { fetchSanityLive };

import { CTA_QUERY, IMAGE_QUERY, LINK_QUERY, NAVIGATION_QUERY } from './queries';

export async function fetchSanity<T = any>({
  query,
  params = {},
  next,
}: {
  query: string;
  params?: Partial<QueryParams>;
  next?: QueryOptions['next'];
}) {
  const preview = dev || (await draftMode()).isEnabled;

  if (preview) {
    return fetchSanityLive<T>({ query, params });
  }

  return client.fetch<T>(query, params, {
    perspective: 'published',
    useCdn: true,
    next: {
      revalidate: 3600, // every hour
      ...next,
    },
  });
}

export async function getSite() {
  const site = await fetchSanity<Sanity.Site>({
    query: groq`
			*[_type == 'site' && _id == 'site'][0]{
				...,
				logo->{
					...,
					image {
						default {
							${IMAGE_QUERY}
						},
						dark {
							${IMAGE_QUERY}
						}
					}
				},
				ctas[]{ ${CTA_QUERY} },
				headerMenu->{ ${NAVIGATION_QUERY} },
				enableSearch,
				footerMenu->{ ${NAVIGATION_QUERY} },
				footerLinks[]{ ${LINK_QUERY} },
				systemStatus,
				socialLinks,
				cookieConsent {
					...,
					privacyPolicy->{
						"slug": metadata.slug.current
					}
				},
				'ogimage': ogimage.asset->url,
				'brandPage': *[_type == "page" && metadata.slug.current == "brand"][0]._id
			}
		`,
  });

  if (!site)
    throw new Error(
      'Missing Site settings: 🫠 Your website might be having an identity crisis...\n\n' +
        'Solution: Publish the Site document in your Medal Social Studio.\n\n' +
        '💁‍♂️ https://www.medalsocial.com'
    );

  return site;
}
