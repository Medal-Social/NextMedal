'use client';

import { useTranslations } from 'next-intl';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { getPageNumbers, usePageState } from '@/lib/hooks/use-pagination';
import ArticleGrid from './ArticleGrid';

export default function Paginated({
  posts,
  collectionSlug,
  totalCount,
  itemsPerPage = 6,
}: {
  posts: Sanity.CollectionArticlePost[];
  collectionSlug: string;
  totalCount: number;
  itemsPerPage?: number;
}) {
  const t = useTranslations('article');
  const { page: currentPage, setPage } = usePageState();

  // Calculate total pages from server-provided count
  const totalPages = Math.ceil(totalCount / itemsPerPage) || 1;

  const atStart = currentPage === 1;
  const atEnd = currentPage === totalPages;

  function scrollToList() {
    if (typeof window !== 'undefined')
      document.querySelector('#article-list')?.scrollIntoView({ behavior: 'smooth' });
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
    <div id="article-list" className="space-y-12">
      {posts.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-lg text-slate-500">{t('noArticles')}</p>
          <p className="text-sm text-slate-400 mt-2">{t('noArticlesDescription')}</p>
        </div>
      ) : (
        <ArticleGrid posts={posts} collectionSlug={collectionSlug} />
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
