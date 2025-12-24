import { notFound } from 'next/navigation';
import { groq } from 'next-sanity';
import { groupPlacements, type Placement } from '@/lib/placement';
import processMetadata from '@/lib/processMetadata';
import resolveUrl from '@/lib/resolveUrl';
import { client } from '@/sanity/lib/client';
import { fetchSanityLive } from '@/sanity/lib/live';
import { IMAGE_QUERY, MODULES_QUERY, placementQuery } from '@/sanity/lib/queries';
import JsonLd from '@/ui/JsonLd';
import Modules from '@/ui/modules';
import BlogPostLayout from '@/ui/modules/blog/BlogPostLayout';

export default async function Page({ params }: Props) {
  const resolvedParams = await params;
  const post = await getPost(resolvedParams);

  if (!post) notFound();

  const placements = groupPlacements(post.placements);

  return (
    <>
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

export async function generateMetadata({ params }: Props) {
  const resolvedParams = await params;
  const post = await getPost(resolvedParams, false);
  if (!post) notFound();
  return processMetadata(post);
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
				...,
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
				'ogimage': image.asset->url + '?w=1200'
			},
			'placements': ${placementsQuery}
		}`,
    params: { ...params, slug: params.slug },
    stega,
  });
}

type Props = {
  params: Promise<{ slug?: string }>;
};
