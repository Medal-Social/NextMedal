import { notFound } from 'next/navigation';
import { groq } from 'next-sanity';
import { mockPost } from '@/lib/mock-blog-post';
import processMetadata from '@/lib/processMetadata';
import resolveUrl from '@/lib/resolveUrl';
import { client } from '@/sanity/lib/client';
import { fetchSanityLive } from '@/sanity/lib/fetch';
import { MODULES_QUERY } from '@/sanity/lib/queries';
import JsonLd from '@/ui/JsonLd';
import Modules from '@/ui/modules';
import BlogPostLayout from '@/ui/modules/blog/BlogPostLayout';

export default async function Page({ params }: Props) {
  const resolvedParams = await params;
  const post = await getPost(resolvedParams);

  if (!post) notFound();

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
      <Modules modules={post.modules} post={post} />
      <BlogPostLayout post={post} />
    </>
  );
}

export async function generateMetadata({ params }: Props) {
  const resolvedParams = await params;
  const post = await getPost(resolvedParams);
  if (!post) notFound();
  return processMetadata(post);
}

export async function generateStaticParams() {
  const slugs = await client.fetch<string[]>(
    groq`*[_type == 'blog.post' && defined(metadata.slug.current)].metadata.slug.current`
  );

  return slugs.map((slug) => ({ slug }));
}

async function getPost(params: { slug?: string }) {
  if (params.slug === 'example-post') {
    return mockPost as any;
  }

  return await fetchSanityLive<Sanity.BlogPost & { modules: Sanity.Module[] }>({
    query: groq`*[_type == 'blog.post' && metadata.slug.current == $slug][0]{
			...,
			body[]{
				...,
				_type == 'image' => { asset-> }
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
				'ogimage': image.asset->url + '?w=1200'
			},
			'modules': (
				// global modules (before)
				*[_type == 'global-module' && path == '*'].before[]{ ${MODULES_QUERY} }
				// path modules (before)
				+ *[_type == 'global-module' && path == 'blog/'].before[]{ ${MODULES_QUERY} }
				// path modules (after)
				+ *[_type == 'global-module' && path == 'blog/'].after[]{ ${MODULES_QUERY} }
				// global modules (after)
				+ *[_type == 'global-module' && path == '*'].after[]{ ${MODULES_QUERY} }
			)
		}`,
    params: { ...params, slug: params.slug },
  });
}

type Props = {
  params: Promise<{ slug?: string }>;
};
