import { fetchSanityLive } from '@/sanity/lib/fetch';
import { groq } from 'next-sanity';
import { stegaClean } from 'next-sanity';
import { Suspense } from 'react';
import FilterList from '../BlogList/FilterList';
import PostPreview from '../PostPreview';
import PostPreviewLarge from '../PostPreviewLarge';
import Paginated from './Paginated';
import sortFeaturedPosts from './sortFeaturedPosts';

export default async function BlogFrontpage({
  mainPost,
  showFeaturedPostsFirst,
  itemsPerPage,
}: Partial<{
  mainPost: 'recent' | 'featured';
  showFeaturedPostsFirst: boolean;
  itemsPerPage: number;
  isTabbedModule?: boolean;
}>) {
  const posts = await fetchSanityLive<Sanity.BlogPost[]>({
    query: groq`*[_type == 'blog.post']|order(publishDate desc){
			_type,
			_id,
			featured,
			metadata,
			categories[]->,
			authors[]->,
			publishDate,
		}`,
  });

  const [firstPost, ...otherPosts] =
    stegaClean(mainPost) === 'featured' ? sortFeaturedPosts(posts) : posts;

  return (
    <section className="section space-y-12">
      <PostPreviewLarge post={firstPost} />

      <hr />

      <FilterList />

      <Suspense
        fallback={
          <ul className="grid gap-x-8 gap-y-12 sm:grid-cols-[repeat(auto-fill,minmax(300px,1fr))]">
            {Array.from({ length: itemsPerPage ?? 6 }).map((_, i) => (
              <li key={`skeleton-${i}`}>
                <PostPreview skeleton />
              </li>
            ))}
          </ul>
        }
      >
        <Paginated
          posts={sortFeaturedPosts(otherPosts, showFeaturedPostsFirst)}
          itemsPerPage={itemsPerPage}
        />
      </Suspense>
    </section>
  );
}
