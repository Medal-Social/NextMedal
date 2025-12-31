'use client';

import { parseAsInteger, useQueryState } from 'nuqs';

/**
 * Hook for client-side pagination with URL state management.
 * Use with shadcn pagination components from @/components/ui/pagination.
 */
export function usePagination<T>({
  items = [],
  itemsPerPage = 6,
}: {
  items: T[];
  itemsPerPage?: number;
}) {
  const { page, setPage } = usePageState();

  const totalPages = Math.ceil(items.length / itemsPerPage) || 1;
  const currentPage = Math.min(page, totalPages); // Clamp to valid range

  const atStart = currentPage === 1;
  const atEnd = currentPage === totalPages;

  const onPrev = () => setPage(Math.max(1, currentPage - 1));
  const onNext = () => setPage(Math.min(totalPages, currentPage + 1));

  const paginatedItems = items.slice(itemsPerPage * (currentPage - 1), itemsPerPage * currentPage);

  return {
    atStart,
    atEnd,
    onPrev,
    onNext,
    setPage,
    paginatedItems,
    currentPage,
    totalPages,
  };
}

/**
 * Hook for URL-based page state using nuqs.
 * Manages ?page=N query parameter.
 */
export function usePageState() {
  const [page, setPage] = useQueryState('page', parseAsInteger.withDefault(1));
  return { page, setPage };
}

/**
 * Generate page numbers with ellipsis for large page counts.
 * Returns array of page numbers and 'ellipsis' markers.
 *
 * Examples:
 * - 5 pages: [1, 2, 3, 4, 5]
 * - 10 pages, current=1: [1, 2, 3, 'ellipsis', 10]
 * - 10 pages, current=5: [1, 'ellipsis', 4, 5, 6, 'ellipsis', 10]
 * - 10 pages, current=10: [1, 'ellipsis', 8, 9, 10]
 */
export function getPageNumbers(currentPage: number, totalPages: number): (number | 'ellipsis')[] {
  // Show all pages if 7 or fewer
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages: (number | 'ellipsis')[] = [1];

  // Add ellipsis after first page if current is far from start
  if (currentPage > 3) {
    pages.push('ellipsis');
  }

  // Add pages around current page
  const start = Math.max(2, currentPage - 1);
  const end = Math.min(totalPages - 1, currentPage + 1);

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  // Add ellipsis before last page if current is far from end
  if (currentPage < totalPages - 2) {
    pages.push('ellipsis');
  }

  pages.push(totalPages);

  return pages;
}
