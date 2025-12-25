'use server';

import type { QueryParams } from 'next-sanity';
import { groq } from 'next-sanity';
import { fetchSanityLive } from './live';
export { fetchSanityLive };

import { CTA_QUERY, IMAGE_QUERY, LINK_QUERY, NAVIGATION_QUERY } from './queries';

export async function fetchSanity<T = any>({
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
					privacyPolicy->
				},
				'ogimage': ogimage.asset->url,
				'brandPage': *[_type == "page" && metadata.slug.current == "brand"][0]._id
			}
		`,
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
