'use client';

import { useBlogFilters } from '@/ui/modules/blog/store';
import ArticleCard from './ArticleCard';

export default function BlogGrid({ posts }: { posts: Sanity.BlogPost[] }) {
  const { view } = useBlogFilters();

  if (view === 'list') {
    return (
      <div className="flex flex-col gap-6">
        {posts.map((post) => (
          <ArticleCard key={post._id} post={post} variant="horizontal" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3 lg:grid-cols-4">
      {posts.map((post, index) => {
        let variant: 'large' | 'wide' | 'standard' = 'standard';
        if (index === 0) variant = 'large';
        else if (index === 1) variant = 'wide';

        return <ArticleCard key={post._id} post={post} variant={variant} />;
      })}
    </div>
  );
}
