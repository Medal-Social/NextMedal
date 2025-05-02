import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function Category({
  value,
  label,
  linked,
  badge = false,
}: {
  value?: Sanity.BlogCategory;
  label?: string;
  linked?: boolean;
  badge?: boolean;
}) {
  const props = {
    className: cn('before:text-current/50 hover:*:underline', !linked && 'pointer-events-none'),
    children: badge ? (
      <Badge variant="secondary">{label || value?.title}</Badge>
    ) : (
      <span>{label || value?.title}</span>
    ),
  };

  return linked && value?.slug?.current ? (
    <Link
      href={{
        pathname: '/blog',
        query: { category: value?.slug.current },
      }}
      {...props}
    />
  ) : (
    <div {...props} />
  );
}
