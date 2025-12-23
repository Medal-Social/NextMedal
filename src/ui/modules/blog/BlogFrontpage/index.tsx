import { groq } from 'next-sanity';
import { Suspense } from 'react';
import moduleProps from '@/lib/moduleProps';
import { fetchSanityLive } from '@/sanity/lib/live';
import { IMAGE_QUERY } from '@/sanity/lib/queries';
import PostPreview from '../PostPreview';
import BlogFilterBar from './BlogFilterBar';
import BlogHero from './BlogHero';
import Paginated from './Paginated';

export default async function BlogFrontpage({
  mainPost,
  itemsPerPage,
  posts: postsProp,
  ...props
}: Sanity.BlogFrontpage) {
  const posts =
    postsProp ||
    (await fetchSanityLive<Sanity.BlogPost[]>({
      query: groq`*[_type == 'blog.post']|order(publishDate desc){
			_type,
			_id,
			featured,
			metadata {
				...,
				image { ${IMAGE_QUERY} }
			},
			categories[]->,
			authors[]->{
				...,
				image { ${IMAGE_QUERY} }
			},
			publishDate,
		}`,
    }));

  // Determine Hero Post
  let heroPost: Sanity.BlogPost | undefined;
  if (mainPost === 'featured') {
    heroPost = posts.find((p) => p.featured === true);
  }
  if (!heroPost) {
    heroPost = posts[0];
  }

  // Filter out hero post
  const remainingPosts = posts.filter((p) => p._id !== heroPost?._id);

  // Determine Sidebar Posts (Recent & Popular)
  // Recent: First remaining post
  const recentPost = remainingPosts[0];

  // Popular: Next featured post, or just next post
  const popularPost = remainingPosts.slice(1).find((p) => p.featured === true) || remainingPosts[1];

  // Grid Posts: All remaining posts excluding hero, recent, and popular
  const gridPosts = remainingPosts.filter(
    (p) => p._id !== recentPost?._id && p._id !== popularPost?._id
  );

  return (
    <div {...moduleProps(props)}>
      <BlogHero featuredPost={heroPost} recentPost={recentPost} popularPost={popularPost} />

      <BlogFilterBar />

      <section className="min-h-screen bg-slate-50 py-8 dark:bg-[#0f172a]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Suspense
            fallback={
              <ul className="grid gap-6 sm:grid-cols-[repeat(auto-fill,minmax(300px,1fr))]">
                {Array.from({ length: itemsPerPage ?? 6 }).map((_, i) => (
                  <li key={`skeleton-${i}`}>
                    <PostPreview skeleton />
                  </li>
                ))}
              </ul>
            }
          >
            <Paginated posts={gridPosts} itemsPerPage={itemsPerPage} />
          </Suspense>
        </div>
      </section>
    </div>
  );
}
