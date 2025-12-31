'use client';

import PostPreview from '../../frontpage/articles/PostPreview';
import { useArticleFilters } from '../../frontpage/articles/store';

export default function List({
  posts,
  sizes,
  ...props
}: {
  posts: Sanity.CollectionArticlePost[];
  sizes?: string;
} & React.ComponentProps<'ul'>) {
  const { category, author, search } = useArticleFilters();
  const filtered = filterPosts(posts, { category, author, search });

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

interface FilterOptions {
  category?: string | null;
  author?: string | null;
  search?: string | null;
}

export function filterPosts(posts: Sanity.CollectionArticlePost[], filters: FilterOptions) {
  const { category, author, search } = filters;

  return posts.filter((post) => {
    // Search filter
    if (search) {
      const searchLower = search.toLowerCase();
      const titleMatch = post.metadata?.title?.toLowerCase().includes(searchLower);
      const descMatch = post.metadata?.description?.toLowerCase().includes(searchLower);
      if (!titleMatch && !descMatch) return false;
    }

    if (category && category !== 'All' && author)
      return (
        post.authors?.some(({ slug }) => slug?.current === author) &&
        post.categories?.some(({ slug }) => slug?.current === category)
      );

    if (category && category !== 'All')
      return post.categories?.some(({ slug }) => slug?.current === category);

    if (author) return post.authors?.some(({ slug }) => slug?.current === author);

    return true;
  });
}
