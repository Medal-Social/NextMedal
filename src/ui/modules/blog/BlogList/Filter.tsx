'use client';

import { Button } from '@/components/ui/button';
import { usePageState } from '@/lib/usePagination';
import Category from '../Category';
import { useBlogFilters } from '../store';

export default function Filter({
  label,
  value = 'All',
}: {
  label: string;
  value?: 'All' | string;
}) {
  const { category, setCategory } = useBlogFilters();
  const { setPage } = usePageState();

  return (
    <Button
      className="rounded-full"
      variant={category === value ? 'secondary' : 'outline'}
      onClick={() => {
        setCategory(value);
        setPage(1);
      }}
    >
      <Category label={label} />
    </Button>
  );
}

//   className={cn(
//     css.filter,
//     "!py-1",
//     category === value
//       ? "action"
//       : "ghost border border-transparent text-black"
//   )}
