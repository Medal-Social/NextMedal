'use client';

import { Calendar, Hash, Inbox } from 'lucide-react';
import { Date as DateDisplay, Img } from '@/components/blocks/objects/core';
import { EmptyState } from '@/components/ui/empty-state';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Link } from '@/i18n/navigation';
import { getPageNumbers, usePagination } from '@/lib/hooks/use-pagination';
import { cn } from '@/lib/utils/index';

interface NewsletterListPaginatedProps {
  newsletters: Sanity.CollectionNewsletter[];
  collectionSlug: string;
  className?: string;
  itemsPerPage?: number;
}

function NewsletterCard({
  issue,
  collectionSlug,
}: {
  issue: Sanity.CollectionNewsletter;
  collectionSlug: string;
}) {
  const href = `/${collectionSlug}/${issue.metadata?.slug?.current}`;

  return (
    <article className="group relative flex h-full flex-col rounded-xl border bg-card shadow-sm transition-all duration-200 hover:shadow-md">
      {/* Featured Image */}
      {issue.seo?.image && (
        <Link href={href} className="block aspect-video overflow-hidden rounded-t-xl">
          <Img
            image={issue.seo.image}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
            alt={issue.metadata?.title || ''}
          />
        </Link>
      )}

      {/* Content */}
      <div className="flex flex-1 flex-col p-5">
        {/* Meta */}
        <div className="mb-3 flex items-center gap-3 text-muted-foreground text-xs">
          {issue.issueNumber && (
            <span className="inline-flex items-center gap-1">
              <Hash className="h-3 w-3" />
              Issue #{issue.issueNumber}
            </span>
          )}
          {issue.publishDate && (
            <span className="inline-flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <DateDisplay value={issue.publishDate} />
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="mb-2 line-clamp-2 font-semibold text-foreground text-lg">
          <Link href={href} className="transition-colors hover:text-primary">
            {issue.metadata?.title}
          </Link>
        </h3>

        {/* Preheader / Description */}
        {(issue.preheader || issue.metadata?.description) && (
          <p className="line-clamp-3 flex-1 text-muted-foreground text-sm">
            {issue.preheader || issue.metadata?.description}
          </p>
        )}

        {/* Featured badge */}
        {issue.featured === 'featured' && (
          <span className="absolute top-3 right-3 rounded-full bg-primary px-2 py-1 font-medium text-primary-foreground text-xs">
            Featured
          </span>
        )}
      </div>
    </article>
  );
}

export default function NewsletterListPaginated({
  newsletters,
  collectionSlug,
  className,
  itemsPerPage = 12,
}: NewsletterListPaginatedProps) {
  const { paginatedItems, currentPage, totalPages, setPage, atStart, atEnd } = usePagination({
    items: newsletters,
    itemsPerPage,
  });

  const pageNumbers = getPageNumbers(currentPage, totalPages);

  function scrollToList() {
    if (typeof window !== 'undefined') {
      document.querySelector('#newsletter-list')?.scrollIntoView({ behavior: 'smooth' });
    }
  }

  function handlePageClick(page: number) {
    return (event: React.MouseEvent) => {
      event.preventDefault();
      setPage(page);
      scrollToList();
    };
  }

  if (!newsletters || newsletters.length === 0) {
    return (
      <EmptyState
        icon={Inbox}
        title="No newsletter issues yet"
        description="No newsletter issues have been published in this collection yet. Check back soon."
      />
    );
  }

  return (
    <div id="newsletter-list" className="space-y-12">
      <ul className={className}>
        {paginatedItems.map((issue) => (
          <li key={issue._id}>
            <NewsletterCard issue={issue} collectionSlug={collectionSlug} />
          </li>
        ))}
      </ul>

      {totalPages > 1 && (
        <div className="mt-12 border-slate-200 border-t pt-8 dark:border-slate-800">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href={`?page=${currentPage - 1}`}
                  onClick={handlePageClick(currentPage - 1)}
                  aria-disabled={atStart}
                  className={cn(atStart && 'pointer-events-none opacity-50')}
                />
              </PaginationItem>

              {pageNumbers.map((page, index) =>
                page === 'ellipsis' ? (
                  <PaginationItem
                    // biome-ignore lint/suspicious/noArrayIndexKey: ellipsis position has no semantic identity
                    key={`ellipsis-${index}`}
                  >
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
                  className={cn(atEnd && 'pointer-events-none opacity-50')}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}
