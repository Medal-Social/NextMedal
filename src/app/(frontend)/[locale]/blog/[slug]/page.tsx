import { notFound } from 'next/navigation';
import { groq } from 'next-sanity';
import { groupPlacements, type Placement } from '@/lib/placement';
import processMetadata from '@/lib/processMetadata';
import resolveUrl from '@/lib/resolveUrl';
import { client } from '@/sanity/lib/client';
import { fetchSanityLive } from '@/sanity/lib/live';
import { IMAGE_QUERY, MODULES_QUERY, PT_BLOCK_QUERY, placementQuery } from '@/sanity/lib/queries';
import Modules from '@/ui/modules';
import BlogPostLayout from '@/ui/modules/blog/BlogPostLayout';
import { BreadcrumbJsonLd, JsonLd } from '@/ui/seo';

export default async function Page({ params }: Props) {
  const resolvedParams = await params;
  const post = await getPost(resolvedParams);

  if (!post) notFound();

  const placements = groupPlacements(post.placements);

  // Build locale-aware breadcrumb paths
  const localePath = resolvedParams.locale ? `/${resolvedParams.locale}` : '';

  const breadcrumbs = [
    { name: 'Home', path: `${localePath}/` },
    { name: 'Blog', path: `${localePath}/blog` },
    ...(post.categories?.[0]
      ? [
          {
            name: post.categories[0].title || 'Category',
            path: `${localePath}/blog?category=${post.categories[0].slug?.current}`,
          },
        ]
      : []),
    {
      name: post.metadata?.title || post.title || 'Post',
      path: `${localePath}/blog/${post.metadata?.slug?.current}`,
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
          author: post.authors?.map((author: Sanity.Person) => ({
            '@type': 'Person',
            name: author.name,
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

export async function generateMetadata({ params, searchParams }: Props) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const post = await getPost(resolvedParams, false);
  if (!post) notFound();
  return processMetadata(post, resolvedSearchParams);
}

export async function generateStaticParams() {
  const slugs = await client
    .withConfig({ stega: false })
    .fetch<string[]>(
      groq`*[_type == 'blog.post' && defined(metadata.slug.current)].metadata.slug.current`,
      {},
      { perspective: 'published' }
    );

  return slugs.map((slug) => ({ slug }));
}

async function getPost(params: { slug?: string }, stega?: boolean) {
  const placementsQuery = placementQuery(
    "scope == 'blog.post' || scope match 'blog*' || scope == 'all-blog-posts'"
  );

  return await fetchSanityLive<
    Sanity.BlogPost & { modules?: Sanity.Module[]; placements: Placement[] }
  >({
    query: groq`*[_type == 'blog.post' && metadata.slug.current == $slug][0]{
			...,
			'modules': modules[]{ ${MODULES_QUERY} },
			body[]{
				${PT_BLOCK_QUERY},
				_type == 'image' => { ${IMAGE_QUERY} }
			},
			'readTime': math::max([1, round(length(string::split(pt::text(body), ' ')) / 200)]),
			'headings': body[style in ['h2', 'h3']]{
				style,
				'text': pt::text(@)
			},
			categories[]->{ _id, title, "slug": { "current": slug.current } },
			authors[]->{ _id, name, language, metadata { "slug": { "current": slug.current } }, image { asset->{ url, metadata { dimensions } } } },
			metadata {
				...,
				image { ${IMAGE_QUERY} },
				'ogimage': image.asset->url + '?w=1200'
			},
			'placements': ${placementsQuery}
		}`,
    params: { ...params, slug: params.slug },
    stega,
  });
}

type Props = {
  params: Promise<{ slug?: string; locale?: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};
