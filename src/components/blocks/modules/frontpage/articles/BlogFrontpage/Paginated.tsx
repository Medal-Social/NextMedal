'use client';

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { getPageNumbers, usePagination } from '@/lib/hooks/use-pagination';
import { filterPosts } from '../../../utility/LatestArticles/List';
import { useBlogFilters } from '../store';
import BlogGrid from './BlogGrid';

export default function Paginated({
  posts,
  itemsPerPage = 6,
}: {
  posts: Sanity.CollectionBlogPost[];
  itemsPerPage?: number;
}) {
  const { search, category, author } = useBlogFilters();

  // Filter all posts - grid always shows all matching posts
  const filteredPosts = filterPosts(posts, { category, author, search });

  const { paginatedItems, currentPage, totalPages, setPage, atStart, atEnd } = usePagination({
    items: filteredPosts,
    itemsPerPage,
  });

  function scrollToList() {
    if (typeof window !== 'undefined')
      document.querySelector('#blog-list')?.scrollIntoView({ behavior: 'smooth' });
  }

  function handlePageClick(page: number) {
    return (event: React.MouseEvent) => {
      event.preventDefault();
      setPage(page);
      scrollToList();
    };
  }

  const pageNumbers = getPageNumbers(currentPage, totalPages);

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
        <div className="mt-12 border-t border-slate-200 pt-8 dark:border-slate-800">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href={`?page=${currentPage - 1}`}
                  onClick={handlePageClick(currentPage - 1)}
                  aria-disabled={atStart}
                  className={atStart ? 'pointer-events-none opacity-50' : undefined}
                />
              </PaginationItem>

              {pageNumbers.map((page, index) =>
                page === 'ellipsis' ? (
                  <PaginationItem key={`ellipsis-${index}`}>
                    <PaginationEllipsis />
                  </PaginationItem>
                ) : (
                  <PaginationItem key={page}>
                    <PaginationLink
                      href={`?page=${page}`}
                      onClick={handlePageClick(page)}
                      isActive={page === currentPage}
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                )
              )}

              <PaginationItem>
                <PaginationNext
                  href={`?page=${currentPage + 1}`}
                  onClick={handlePageClick(currentPage + 1)}
                  aria-disabled={atEnd}
                  className={atEnd ? 'pointer-events-none opacity-50' : undefined}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}
