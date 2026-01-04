'use client';

import { useArticleFilters } from '@/components/blocks/modules/frontpage/articles/store';
import ArticleCard from './ArticleCard';

// Bento grid pattern - creates visual rhythm in 4-column grid
// Pattern: [wide, std, std] repeats = 2+1+1 = 4 cols per row
function getVariant(index: number): 'wide' | 'standard' {
  return index % 3 === 0 ? 'wide' : 'standard';
}

export default function ArticleGrid({
  posts,
  collectionSlug,
}: {
  posts: Sanity.CollectionArticlePost[];
  collectionSlug: string;
}) {
  const { view } = useArticleFilters();

  if (view === 'list') {
    return (
      <div className="flex flex-col gap-6">
        {posts.map((post) => (
          <ArticleCard
            key={post._id}
            post={post}
            collectionSlug={collectionSlug}
            variant="horizontal"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {posts.map((post, index) => (
        <ArticleCard
          key={post._id}
          post={post}
          collectionSlug={collectionSlug}
          variant={getVariant(index)}
        />
      ))}
    </div>
  );
}
