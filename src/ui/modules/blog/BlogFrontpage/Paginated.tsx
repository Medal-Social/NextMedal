'use client';

import { usePagination } from '@/lib/usePagination';
import List, { filterPosts } from '../BlogList/List';

export default function Paginated({
  posts,
  itemsPerPage = 6,
}: {
  posts: Sanity.BlogPost[];
  itemsPerPage?: number;
}) {
  const { paginatedItems, Pagination } = usePagination({
    items: filterPosts(posts),
    itemsPerPage,
  });

  function scrollToList() {
    if (typeof window !== 'undefined')
      document.querySelector('#blog-list')?.scrollIntoView({ behavior: 'smooth' });
  }

  return (
    <div className="relative space-y-12">
      <List
        id="blog-list"
        posts={paginatedItems}
        className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-3"
      />

      <Pagination
        className="sticky bottom-0 flex items-center justify-center gap-4 bg-background/95 p-2 pb-[max(env(safe-area-inset-bottom),0.5rem)] tabular-nums"
        buttonClassName="hover:underline disabled:opacity-20"
        onClick={scrollToList}
      />
    </div>
  );
}
