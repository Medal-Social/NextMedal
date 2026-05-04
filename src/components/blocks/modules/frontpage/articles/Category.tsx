'use client';

import { usePathname } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Link } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';
import { useCollectionSlug } from '@/lib/collections/context';
import { cn } from '@/lib/utils/index';
import { createStegaAttribute } from '@/sanity/lib/client';

export default function Category({
  value,
  label,
  linked,
  badge = false,
  collectionSlug,
}: {
  value?: Sanity.ArticleCategory;
  label?: string;
  linked?: boolean;
  badge?: boolean;
  collectionSlug?: string;
}) {
  const pathname = usePathname();
  const articlesSlug = useCollectionSlug('collection.article');

  const stega = value?._id
    ? createStegaAttribute({
        id: value._id,
        type: value._type || 'article.category',
        path: 'title',
      })
    : undefined;

  // Extract collection slug from current pathname or use provided prop or use context
  const getCollectionPath = () => {
    if (collectionSlug) return `/${collectionSlug}`;

    // Try to extract from current pathname
    // Remove locale prefix if present
    const pathWithoutLocale = pathname?.replace(new RegExp(`^/(${routing.locales.join('|')})`), '');

    // Extract first segment (collection slug)
    const match = pathWithoutLocale?.match(/^\/([^/?]+)/);
    // Use matched slug or fall back to articles collection from context
    return match ? `/${match[1]}` : `/${articlesSlug || 'articles'}`;
  };

  const props = {
    className: cn('before:text-current/50 hover:*:underline', !linked && 'pointer-events-none'),
    'data-sanity': stega?.toString(),
    children: badge ? (
      <Badge
        variant="secondary"
        className="rounded-full bg-purple-100 px-3 py-1 font-semibold text-purple-800 hover:bg-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:hover:bg-purple-900/50"
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
        pathname: getCollectionPath(),
        query: { category: value?.slug.current },
      }}
      {...props}
    />
  ) : (
    <div {...props} />
  );
}
