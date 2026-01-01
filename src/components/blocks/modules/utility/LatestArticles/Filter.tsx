'use client';

import { Button } from '@/components/ui/button';
import { usePageState } from '@/lib/hooks/use-pagination';
import Category from '../../frontpage/articles/Category';
import { useArticleFilters } from '../../frontpage/articles/store';

export default function Filter({
  label,
  value = 'All',
}: {
  label: string;
  value?: 'All' | string;
}) {
  const { category, setCategory } = useArticleFilters();
  const { setPage } = usePageState();

  return (
    <Button
      variant="ghost"
      className={
        category === value
          ? 'bg-primary/5 text-primary hover:bg-primary/5 hover:text-primary'
          : 'hover:bg-primary/5 hover:text-primary'
      }
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
