'use client';

import PostPreview from '../PostPreview';
import { useBlogFilters } from '../store';

export default function List({
  posts,
  sizes,
  ...props
}: {
  posts: Sanity.BlogPost[];
  sizes?: string;
} & React.ComponentProps<'ul'>) {
  const filtered = filterPosts(posts);

  if (!filtered.length) {
    return <div>No posts found...</div>;
  }

  return (
    <ul className="" {...props}>
      {filtered?.map((post, index) => (
        <li className="animate-fade" key={post._id ? `${post._id}-${index}` : index}>
          <PostPreview post={post} sizes={sizes} />
        </li>
      ))}
    </ul>
  );
}

export function filterPosts(posts: Sanity.BlogPost[]) {
  const { category, author, search } = useBlogFilters();

  return posts.filter((post) => {
    // Search filter
    if (search) {
      const searchLower = search.toLowerCase();
      const titleMatch = post.metadata?.title?.toLowerCase().includes(searchLower);
      const descMatch = post.metadata?.description?.toLowerCase().includes(searchLower);
      if (!titleMatch && !descMatch) return false;
    }

    if (category !== 'All' && author)
      return (
        post.authors?.some(({ slug }) => slug?.current === author) &&
        post.categories?.some(({ slug }) => slug?.current === category)
      );

    if (category !== 'All') return post.categories?.some(({ slug }) => slug?.current === category);

    if (author) return post.authors?.some(({ slug }) => slug?.current === author);

    return true;
  });
}
