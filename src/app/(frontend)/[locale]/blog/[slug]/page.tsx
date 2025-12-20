import { notFound } from 'next/navigation';
import { groq } from 'next-sanity';
import processMetadata from '@/lib/processMetadata';
import { client } from '@/sanity/lib/client';
import { fetchSanityLive } from '@/sanity/lib/fetch';
import { GLOBAL_MODULE_QUERY, MODULES_QUERY } from '@/sanity/lib/queries';
import Modules from '@/ui/modules';
import Content from '@/ui/modules/RichtextModule/Content';

export default async function Page({ params }: Props) {
  const resolvedParams = await params;
  const post = await getPost(resolvedParams);

  if (!post) notFound();
  
  return (
    <>
      <Modules modules={post.modules} />

      <article className="section py-12 md:py-24">
        <div className="container max-w-4xl mx-auto px-4">
           <h1 className="text-4xl md:text-6xl font-bold mb-8">{post.metadata.title}</h1>
           <Content value={post.body} />
        </div>
      </article>
    </>
  );
}

export async function generateMetadata({ params }: Props) {
  const post = await getPost(await params);
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
