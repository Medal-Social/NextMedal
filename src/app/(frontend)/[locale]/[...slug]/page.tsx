import { notFound } from 'next/navigation';
import { groq } from 'next-sanity';
import { PageProvider } from '@/contexts/PageContext';
import { groupPlacements, type Placement } from '@/lib/placement';
import processMetadata from '@/lib/processMetadata';
import resolveUrl from '@/lib/resolveUrl';
import { client } from '@/sanity/lib/client';
import { fetchSanityLive } from '@/sanity/lib/live';
import {
  IMAGE_QUERY,
  MODULES_QUERY,
  PT_BLOCK_QUERY,
  placementQuery,
  SLUG_QUERY,
  TRANSLATIONS_QUERY,
} from '@/sanity/lib/queries';
import BreadcrumbJsonLd from '@/ui/BreadcrumbJsonLd';
import JsonLd from '@/ui/JsonLd';
import Modules from '@/ui/modules';
import BlogPostLayout from '@/ui/modules/blog/BlogPostLayout';

export default async function Page({ params }: Props) {
  const resolvedParams = await params;
  const page = await getPage(resolvedParams);
  if (!page) notFound();

  const placements = groupPlacements(page.placements);

  if (page._type === 'blog.post') {
    const post = page as Sanity.BlogPost & { modules?: Sanity.Module[]; placements: Placement[] };
    const breadcrumbs = [
      { name: 'Home', path: '/' },
      { name: 'Blog', path: '/blog' },
      ...(post.categories?.[0]
        ? [
            {
              name: post.categories[0].title || 'Category',
              path: `/blog?category=${post.categories[0].slug?.current}`,
            },
          ]
        : []),
      {
        name: post.metadata?.title || post.title || 'Post',
        path: `/${post.metadata?.slug?.current}`,
      },
    ];

    return (
      <>
        <BreadcrumbJsonLd items={breadcrumbs} />
        <JsonLd
          data={{
            '@context': 'https://schema.org',
            '@type': 'BlogPosting',
            headline: post.metadata?.title,
            description: post.metadata?.description,
            image: post.metadata?.ogimage,
            datePublished: post.publishDate,
            dateModified: post._updatedAt,
            author: post.authors?.map((author: any) => ({
              '@type': 'Person',
              name: author.name,
              url: resolveUrl(author, { base: true }),
            })),
            mainEntityOfPage: {
              '@type': 'WebPage',
              '@id': resolveUrl(post, { base: true }),
            },
          }}
        />
        {post.modules && post.modules.length > 0 && <Modules modules={post.modules} post={post} />}
        <BlogPostLayout post={post} placements={placements} />
      </>
    );
  }

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
			_type in ['page', 'component.library', 'blog.post'] &&
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
    | Sanity.Page
    | (Sanity.ComponentLibrary & { placements?: Placement[] })
    | (Sanity.BlogPost & { modules?: Sanity.Module[]; placements: Placement[] })
  >({
    query: groq`*[
			_type in ['page', 'component.library', 'blog.post'] &&
			${SLUG_QUERY} == $slug &&
			!(metadata.slug.current in ['index'])
		][0]{
			...,
			'modules': modules[]{ ${MODULES_QUERY} },
			_type == 'blog.post' => {
				body[]{
					${PT_BLOCK_QUERY},
					_type == 'image' => { ${IMAGE_QUERY} }
				},
				'readTime': length(string::split(pt::text(body), ' ')) / 200,
				'headings': body[style in ['h2', 'h3']]{
					style,
					'text': pt::text(@)
				},
				categories[]->,
				authors[]->,
				metadata {
					...,
					image { ${IMAGE_QUERY} },
				},
				'placements': ${placementQuery(
          "scope == 'blog.post' || scope match 'blog*' || scope == 'all-blog-posts'"
        )},
			},
			_type != 'blog.post' => {
				'placements': ${placementQuery("scope == 'page'")},
				parent[]->{ metadata { slug } },
			},
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
