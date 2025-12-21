'use server';

import { draftMode } from 'next/headers';
import { groq, type QueryOptions, type QueryParams } from 'next-sanity';
import { defineLive } from 'next-sanity/live';
import { dev } from '@/lib/env';
import { client } from '@/sanity/lib/client';
import { token } from '@/sanity/lib/token';
import { CTA_QUERY, LINK_QUERY, NAVIGATION_QUERY } from './queries';

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

  return client.fetch<T>(
    query,
    params,
    preview
      ? {
          stega: true,
          perspective: 'drafts',
          useCdn: false,
          token,
          next: {
            revalidate: 0,
            ...next,
          },
        }
      : {
          perspective: 'published',
          useCdn: true,
          next: {
            revalidate: 3600, // every hour
            ...next,
          },
        }
  );
}

export const { sanityFetch, SanityLive } = defineLive({
  client,
  serverToken: token,
  browserToken: token,
});

export async function fetchSanityLive<T = any>(args: Parameters<typeof sanityFetch>[0]) {
  const preview = dev || (await draftMode()).isEnabled;

  const { data } = await sanityFetch({
    ...args,
    perspective: preview ? 'drafts' : 'published',
  });

  return data as T;
}

export async function getSite() {
  const site = await fetchSanityLive<Sanity.Site>({
    query: groq`
			*[_type == 'site' && _id == 'site'][0]{
				...,
				logo->{
					...,
					image {
						default {
							...,
							asset->
						},
						dark {
							...,
							asset->
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
