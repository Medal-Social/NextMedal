import { Suspense } from 'react';
import { fetchSanityLive } from '@/sanity/lib/live';
import { BLOG_CATEGORIES_WITH_POSTS_QUERY } from '@/sanity/lib/queries';
import BlogFilterBarClient from './BlogFilterBarClient';

export default async function BlogFilterBar() {
  const categories = await fetchSanityLive<Sanity.BlogCategory[]>({
    query: BLOG_CATEGORIES_WITH_POSTS_QUERY,
  });

  return (
    <section className="sticky top-[var(--header-height)] z-40 border-b border-slate-200 bg-white/95 backdrop-blur-sm transition-all dark:border-slate-800 dark:bg-[#0f172a]/95">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Suspense fallback={<div className="h-14" />}>
          <BlogFilterBarClient categories={categories} />
        </Suspense>
      </div>
    </section>
  );
}
