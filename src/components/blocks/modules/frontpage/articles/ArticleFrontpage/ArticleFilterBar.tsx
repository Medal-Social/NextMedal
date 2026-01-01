import { Suspense } from 'react';
import { fetchSanityLive } from '@/sanity/lib/live';
import { ARTICLE_CATEGORIES_WITH_POSTS_QUERY } from '@/sanity/lib/queries';
import ArticleFilterBarClient from './ArticleFilterBar.client';

interface ArticleFilterBarProps {
  rssUrl?: string;
  collectionSlug?: string;
  locale?: string;
}

export default async function ArticleFilterBar({
  rssUrl,
  collectionSlug = '',
  locale = '',
}: ArticleFilterBarProps) {
  const categories = await fetchSanityLive<Sanity.ArticleCategory[]>({
    query: ARTICLE_CATEGORIES_WITH_POSTS_QUERY,
    params: { collectionSlug, locale },
  });

  return (
    <section className="sticky top-[var(--header-height)] z-40 border-b border-slate-200 bg-white/95 backdrop-blur-sm transition-all dark:border-slate-800 dark:bg-[#0f172a]/95">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Suspense fallback={<div className="h-14" />}>
          <ArticleFilterBarClient categories={categories} rssUrl={rssUrl} />
        </Suspense>
      </div>
    </section>
  );
}
