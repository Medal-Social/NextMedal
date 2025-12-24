'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { usePagination } from '@/lib/usePagination';
import { filterPosts } from '../LatestArticles/List';
import { useBlogFilters } from '../store';
import BlogGrid from './BlogGrid';

export default function Paginated({
  posts,
  itemsPerPage = 6,
}: {
  posts: Sanity.BlogPost[];
  itemsPerPage?: number;
}) {
  const { paginatedItems, currentPage, totalPages, onPrev, onNext, atStart, atEnd } = usePagination(
    {
      items: filterPosts(posts),
      itemsPerPage,
    }
  );

  const { search, category } = useBlogFilters();

  function scrollToList() {
    if (typeof window !== 'undefined')
      document.querySelector('#blog-list')?.scrollIntoView({ behavior: 'smooth' });
  }

  return (
    <div id="blog-list" className="space-y-12">
      {paginatedItems.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-lg text-slate-500">
            No posts found for "{search}" in {category}...
          </p>
        </div>
      ) : (
        <BlogGrid posts={paginatedItems} />
      )}

      {totalPages > 1 && (
        <div className="mt-12 flex items-center justify-center border-t border-slate-200 pt-8 dark:border-slate-800">
          <nav
            className="isolate inline-flex -space-x-px rounded-md shadow-sm"
            aria-label="Pagination"
          >
            <button
              type="button"
              onClick={() => {
                onPrev();
                scrollToList();
              }}
              disabled={atStart}
              className="relative inline-flex items-center rounded-l-md px-3 py-2 text-slate-400 ring-1 ring-inset ring-slate-300 hover:bg-slate-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:hover:bg-transparent dark:ring-slate-700 dark:hover:bg-slate-800 dark:text-slate-500"
            >
              <span className="sr-only">Previous</span>
              <ChevronLeft className="h-4 w-4" />
            </button>

            {/* Simple page info for now, can be expanded to full pagination logic */}
            <span className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-slate-900 ring-1 ring-inset ring-slate-300 focus:outline-offset-0 dark:text-slate-200 dark:ring-slate-700">
              Page {currentPage} of {totalPages}
            </span>

            <button
              type="button"
              onClick={() => {
                onNext();
                scrollToList();
              }}
              disabled={atEnd}
              className="relative inline-flex items-center rounded-r-md px-3 py-2 text-slate-400 ring-1 ring-inset ring-slate-300 hover:bg-slate-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:hover:bg-transparent dark:ring-slate-700 dark:hover:bg-slate-800 dark:text-slate-500"
            >
              <span className="sr-only">Next</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </nav>
        </div>
      )}
    </div>
  );
}
