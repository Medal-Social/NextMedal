import { notFound } from 'next/navigation';
import { groq } from 'next-sanity';
import processMetadata from '@/lib/processMetadata';
import { client } from '@/sanity/lib/client';
import { fetchSanityLive } from '@/sanity/lib/fetch';
import {
  GLOBAL_MODULE_QUERY,
  MODULES_QUERY,
  SLUG_QUERY,
  TRANSLATIONS_QUERY,
} from '@/sanity/lib/queries';
import Modules from '@/ui/modules';
import { PageProvider } from '@/contexts/PageContext';

export default async function Page({ params }: Props) {
  const resolvedParams = await params;
  const page = await getPage(resolvedParams);
  if (!page) notFound();
  return (
    <PageProvider page={page}>
      <Modules modules={page.modules} page={page} />
    </PageProvider>
  );
}

export async function generateMetadata({ params }: Props) {
  const resolvedParams = await params;
  const page = await getPage(resolvedParams);
  if (!page) notFound();
  return processMetadata(page);
}

export async function generateStaticParams() {
  const slugs = await client.fetch<{ slug: string }[]>(
    groq`*[
			_type == 'page' &&
			defined(metadata.slug.current) &&
			!(metadata.slug.current in ['index'])
		]{
			'slug': metadata.slug.current
		}`
  );

  return slugs.map(({ slug }) => ({ slug: slug.split('/') }));
}

async function getPage(params: { slug?: string[] }) {
  const slug = params.slug?.join('/');

  return await fetchSanityLive<Sanity.Page>({
    query: groq`*[
			_type == 'page' &&
			${SLUG_QUERY} == $slug &&
			!(metadata.slug.current in ['index'])
		][0]{
			...,
			'modules': (
				// global modules (before)
				*[_type == 'global-module' && path == '*'].before[]{ ${MODULES_QUERY} }
				// path modules (before)
				+ *[_type == 'global-module' && path != '*' && ${GLOBAL_MODULE_QUERY}].before[]{ ${MODULES_QUERY} }
				// page modules
				+ modules[]{ ${MODULES_QUERY} }
				// path modules (after)
				+ *[_type == 'global-module' && path != '*' && ${GLOBAL_MODULE_QUERY}].after[]{ ${MODULES_QUERY} }
				// global modules (after)
				+ *[_type == 'global-module' && path == '*'].after[]{ ${MODULES_QUERY} }
			),
			parent[]->{ metadata { slug } },
			metadata {
				...,
				'ogimage': image.asset->url + '?w=1200'
			},
			${TRANSLATIONS_QUERY}
		}`,
    params: { slug },
  });
}

type Props = {
  params: Promise<{ slug?: string[] }>;
};
