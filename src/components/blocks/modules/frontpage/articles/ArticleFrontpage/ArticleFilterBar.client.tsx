'use client';

import { LayoutGrid, List, Rss } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useArticleFilters } from '@/components/blocks/modules/frontpage/articles/store';
import { Button } from '@/components/ui/button';
import { ButtonGroup } from '@/components/ui/button-group';
import { usePageState } from '@/lib/hooks/use-pagination';
import { cn } from '@/lib/utils/index';

interface ArticleFilterBarClientProps {
  categories: Sanity.ArticleCategory[];
  rssUrl?: string;
}

export default function ArticleFilterBarClient({
  categories,
  rssUrl,
}: ArticleFilterBarClientProps) {
  const t = useTranslations('article');
  const { category, setCategory, view, setView } = useArticleFilters();
  const { setPage } = usePageState();

  const handleCategoryChange = (newCategory: string) => {
    setCategory(newCategory);
    setPage(1);
  };

  return (
    <div className="flex h-14 items-center justify-between">
      {/* Categories */}
      <div className="no-scrollbar flex flex-1 items-center space-x-6 overflow-x-auto pr-4">
        <button
          type="button"
          onClick={() => handleCategoryChange('All')}
          className={cn(
            'whitespace-nowrap border-b-2 py-4 text-xs font-bold tracking-wide uppercase transition-colors',
            category === 'All'
              ? 'border-primary text-[#1a0b2e] dark:border-purple-400 dark:text-white'
              : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700 dark:text-slate-400 dark:hover:border-slate-600 dark:hover:text-slate-200'
          )}
        >
          {t('allArticles')}
        </button>
        {categories?.map((cat) => (
          <button
            type="button"
            key={cat._id}
            onClick={() => handleCategoryChange(cat.slug?.current || '')}
            className={cn(
              'whitespace-nowrap border-b-2 py-4 text-xs font-bold tracking-wide uppercase transition-colors',
              category === cat.slug?.current
                ? 'border-primary text-[#1a0b2e] dark:border-purple-400 dark:text-white'
                : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700 dark:text-slate-400 dark:hover:border-slate-600 dark:hover:text-slate-200'
            )}
          >
            {cat.title}
          </button>
        ))}
      </div>

      {/* View Toggle and RSS */}
      <div className="flex items-center space-x-4 border-l border-slate-200 bg-white pl-4 dark:border-slate-700 dark:bg-[#0f172a] md:bg-transparent">
        <ButtonGroup className="rounded-lg border border-slate-200 bg-slate-100 p-0.5 dark:border-slate-700 dark:bg-slate-800">
          <Button
            variant="ghost"
            size="icon-xs"
            aria-label="Grid View"
            onClick={() => setView('grid')}
            className={cn(
              'rounded-md transition-all',
              view === 'grid' || !view
                ? 'bg-white text-primary shadow-sm dark:bg-slate-700 dark:text-purple-300'
                : 'text-slate-400 hover:bg-white hover:text-slate-600 dark:hover:bg-slate-700 dark:hover:text-slate-200'
            )}
          >
            <LayoutGrid className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon-xs"
            aria-label="List View"
            onClick={() => setView('list')}
            className={cn(
              'rounded-md transition-all',
              view === 'list'
                ? 'bg-white text-primary shadow-sm dark:bg-slate-700 dark:text-purple-300'
                : 'text-slate-400 hover:bg-white hover:text-slate-600 dark:hover:bg-slate-700 dark:hover:text-slate-200'
            )}
          >
            <List className="size-4" />
          </Button>
        </ButtonGroup>

        {rssUrl && (
          <Link
            href={rssUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-md p-1.5 text-slate-400 transition-all hover:bg-slate-100 hover:text-purple-500 dark:hover:bg-slate-800 dark:hover:text-purple-400"
            title="Subscribe via RSS"
            aria-label="RSS Feed"
          >
            <Rss className="h-4 w-4" />
          </Link>
        )}
      </div>
    </div>
  );
}
