'use client';

import { LayoutGrid, List, Search } from 'lucide-react';
import { usePageState } from '@/lib/usePagination';
import { cn } from '@/lib/utils';
import { useBlogFilters } from '@/ui/modules/blog/store';

export default function BlogFilterBarClient({ categories }: { categories: Sanity.BlogCategory[] }) {
  const { category, setCategory, search, setSearch, view, setView } = useBlogFilters();
  const { setPage } = usePageState();

  const handleCategoryChange = (newCategory: string) => {
    setCategory(newCategory);
    setPage(1);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
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
          All Stories
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

      {/* Search and View Toggle */}
      <div className="flex items-center space-x-4 border-l border-slate-200 bg-white pl-4 dark:border-slate-700 dark:bg-[#0f172a] md:bg-transparent">
        <div className="relative hidden md:block">
          <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2">
            <Search className="h-4 w-4 text-slate-400" />
          </span>
          <input
            type="text"
            placeholder="Explore articles..."
            value={search || ''}
            onChange={handleSearchChange}
            className="block w-full rounded-md border border-slate-200 bg-slate-50 py-1.5 pl-8 pr-3 text-slate-900 placeholder-slate-400 transition-all focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary hover:bg-white sm:text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
          />
        </div>

        <div className="flex items-center space-x-1 rounded-lg border border-slate-200 bg-slate-100 p-0.5 dark:border-slate-700 dark:bg-slate-800">
          <button
            type="button"
            aria-label="Grid View"
            onClick={() => setView('grid')}
            className={cn(
              'rounded-md p-1.5 transition-all',
              view === 'grid' || !view
                ? 'bg-white text-primary shadow-sm dark:bg-slate-700 dark:text-purple-300'
                : 'text-slate-400 hover:bg-white hover:text-slate-600 dark:hover:bg-slate-700 dark:hover:text-slate-200'
            )}
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="List View"
            onClick={() => setView('list')}
            className={cn(
              'rounded-md p-1.5 transition-all',
              view === 'list'
                ? 'bg-white text-primary shadow-sm dark:bg-slate-700 dark:text-purple-300'
                : 'text-slate-400 hover:bg-white hover:text-slate-600 dark:hover:bg-slate-700 dark:hover:text-slate-200'
            )}
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
