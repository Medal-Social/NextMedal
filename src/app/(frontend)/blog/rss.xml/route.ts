import resolveUrl from '@/lib/resolveUrl';
import { fetchSanityLive } from '@/sanity/lib/fetch';
import { urlFor } from '@/sanity/lib/image';
import { escapeHTML, toHTML } from '@portabletext/to-html';
import { Feed } from 'feed';
import { groq } from 'next-sanity';

// Next.js Route Handler for RSS feed
export async function GET() {
  try {
    const { blog, posts, copyright } = await fetchSanityLive<{
      blog: Sanity.Page;
      posts: Array<Sanity.BlogPost & { image?: string }>;
      copyright: string;
    }>({
      query: groq`{
				'blog': *[_type == 'page' && metadata.slug.current == 'blog'][0]{
					_type,
					title,
					metadata,
					'image': metadata.image.asset->url
				},
				'posts': *[_type == 'blog.post']{
					_type,
					body,
					publishDate,
					authors[]->,
					metadata,
					'image': metadata.image.asset->url
				},
				'copyright': pt::text(*[_type == 'site'][0].copyright)
			}`,
    });

    if (!blog || !posts) {
      return new Response('Missing either a blog page or blog posts in Medal Social Studio', {
        status: 500,
      });
    }

    const url = resolveUrl(blog);

    const feed = new Feed({
      title: blog?.title || blog.metadata.title,
      description: blog.metadata.description,
      link: url,
      id: url,
      copyright,
      favicon: `${process.env.NEXT_PUBLIC_BASE_URL}/favicon.ico`,
      language: 'en',
      generator: 'https://www.medalsocial.com',
    });

    posts.forEach((post) => {
      if (!post.metadata) return; // Skip posts without metadata
      feed.addItem({
        title: escapeHTML(post.metadata.title),
        description: post.metadata.description,
        id: resolveUrl(post as Sanity.PageBase),
        link: resolveUrl(post as Sanity.PageBase),
        published: new Date(post.publishDate),
        date: new Date(post.publishDate),
        author: post.authors?.map((author) => ({ name: author.name })),
        content: toHTML(post.body, {
          components: {
            types: {
              image: ({ value }) => {
                const { alt = '', caption, source, ...imageValue } = value;
                const img = `<img src="${urlFor(imageValue).url()}" alt="${escapeHTML(alt)}" />`;
                const figcaption = caption && `<figcaption>${escapeHTML(caption)}</figcaption>`;
                const aSource = source && `<a href="${escapeHTML(source)}" rel="noopener noreferrer">(Source)</a>`;

                return `<figure>${[img, figcaption, aSource].filter(Boolean).join(' ')}</figure>`;
              },
              admonition: ({ value: { title, content } }) =>
                `<dl><dt>${title}</dt><dd>${escapeHTML(content)}</dd></dl>`,
              code: ({ value }) => `<pre><code>${escapeHTML(value.code)}</code></pre>`,
            },
          },
        }),
        image: post.image,
      });
    });

    return new Response(feed.atom1(), {
      headers: {
        'Content-Type': 'application/atom+xml',
      },
    });
  } catch (error) {
    console.error('Error generating RSS feed:', error);
    return new Response('Error generating RSS feed', { status: 500 });
  }
}
