import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils/index';
import { createStegaAttribute } from '@/sanity/lib/client';

export default function Category({
  value,
  label,
  linked,
  badge = false,
}: {
  value?: Sanity.ArticleCategory;
  label?: string;
  linked?: boolean;
  badge?: boolean;
}) {
  const stega = value?._id
    ? createStegaAttribute({
        id: value._id,
        type: value._type || 'article.category',
        path: 'title',
      })
    : undefined;

  const props = {
    className: cn('before:text-current/50 hover:*:underline', !linked && 'pointer-events-none'),
    'data-sanity': stega?.toString(),
    children: badge ? (
      <Badge
        variant="secondary"
        className="bg-purple-100 text-purple-800 hover:bg-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:hover:bg-purple-900/50 rounded-full px-3 py-1 font-semibold"
      >
        {label || value?.title}
      </Badge>
    ) : (
      <span>{label || value?.title}</span>
    ),
  };

  return linked && value?.slug?.current ? (
    <Link
      href={{
        pathname: '/articles',
        query: { category: value?.slug.current },
      }}
      {...props}
    />
  ) : (
    <div {...props} />
  );
}
