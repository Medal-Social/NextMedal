import { notFound } from 'next/navigation';
import { groq } from 'next-sanity';
import { PageProvider } from '@/contexts/PageContext';
import { groupPlacements, type Placement } from '@/lib/placement';
import processMetadata from '@/lib/processMetadata';
import { client } from '@/sanity/lib/client';
import { fetchSanityLive } from '@/sanity/lib/live';
import {
  MODULES_QUERY,
  placementQuery,
  SLUG_QUERY,
  TRANSLATIONS_QUERY,
} from '@/sanity/lib/queries';
import Modules from '@/ui/modules';

export default async function Page({ params }: Props) {
  const resolvedParams = await params;
  const page = await getPage(resolvedParams);
  if (!page) notFound();

  const placements = groupPlacements(page.placements);

  return (
    <PageProvider page={page}>
      {placements.top && <Modules modules={placements.top} />}
      {page.modules && page.modules.length > 0 && <Modules modules={page.modules} page={page} />}
      {placements.bottom && <Modules modules={placements.bottom} />}
    </PageProvider>
  );
}

export async function generateMetadata({ params, searchParams }: Props) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const page = await getPage(resolvedParams, false);
  if (!page) notFound();
  return processMetadata(page, resolvedSearchParams);
}

export async function generateStaticParams() {
  const slugs = await client.withConfig({ stega: false }).fetch<{ slug: string }[]>(
    groq`*[
			_type in ['page', 'component.library'] &&
			defined(metadata.slug.current) &&
			!(metadata.slug.current in ['index'])
		]{
			'slug': metadata.slug.current
		}`,
    {},
    { perspective: 'published' }
  );

  return slugs.map(({ slug }) => ({ slug: slug.split('/') }));
}

async function getPage(params: { slug?: string[] }, stega?: boolean) {
  const slug = params.slug?.join('/');

  return await fetchSanityLive<
    Sanity.Page | (Sanity.ComponentLibrary & { placements?: Placement[] })
  >({
    query: groq`*[
			_type in ['page', 'component.library'] &&
			${SLUG_QUERY} == $slug &&
			!(metadata.slug.current in ['index'])
		][0]{
			...,
			'modules': modules[]{ ${MODULES_QUERY} },
			'placements': ${placementQuery("scope == 'page'")},
			parent[]->{ metadata { slug } },
			metadata {
				...,
				'ogimage': image.asset->url + '?w=1200'
			},
			${TRANSLATIONS_QUERY}
		}`,
    params: { slug },
    stega,
  });
}

type Props = {
  params: Promise<{ slug?: string[] }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};
