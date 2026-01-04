import { Clock } from 'lucide-react';
import Link from 'next/link';
import AuthorCard from '@/components/blocks/modules/frontpage/articles/AuthorCard';
import { Date as DateDisplay, Img } from '@/components/blocks/objects/core';
import { routing } from '@/i18n/routing';
import { getArticleFallbackImage } from '@/lib/utils/article-helpers';
import { cn } from '@/lib/utils/index';
import { createStegaAttribute } from '@/sanity/lib/client';

interface ArticleCardProps {
  post: Sanity.CollectionArticlePost;
  collectionSlug: string;
  variant?: 'large' | 'wide' | 'standard' | 'horizontal';
  className?: string;
}

type CardVariant = ArticleCardProps['variant'];

// Get image container classes based on variant
function getImageClass(variant: CardVariant) {
  const baseClass = 'relative overflow-hidden';
  const variantClasses: Record<NonNullable<CardVariant>, string> = {
    large: 'h-72 lg:h-96 bg-gradient-to-br from-indigo-300 to-purple-400',
    wide: 'h-56 bg-gradient-to-br from-cyan-200 to-cyan-500',
    standard: 'h-48 bg-gradient-to-br from-cyan-300 to-blue-400',
    horizontal:
      'h-48 w-full shrink-0 bg-gradient-to-br from-cyan-300 to-blue-400 md:h-auto md:w-72 lg:w-96',
  };
  return cn(baseClass, variantClasses[variant || 'standard']);
}

// Get article container classes based on variant
function getArticleClass(variant: CardVariant, className?: string) {
  return cn(
    'group/card flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] dark:border-slate-700 dark:bg-slate-800/50 dark:shadow-none',
    variant === 'large' && 'md:col-span-2 md:row-span-2',
    variant === 'wide' && 'md:col-span-2',
    variant === 'horizontal' && 'md:flex-row',
    className
  );
}

// Read time display component
function ReadTimeDisplay({ readTime }: { readTime?: number }) {
  if (!readTime) return null;
  return (
    <span className="inline-flex items-center gap-1 whitespace-nowrap">
      <span>·</span>
      <Clock className="h-3 w-3 shrink-0" />
      <span>{readTime} min</span>
    </span>
  );
}

export default function ArticleCard({
  post,
  collectionSlug,
  variant = 'standard',
  className,
}: ArticleCardProps) {
  // Build URL using the actual collection slug from site settings
  const languagePrefix =
    post.language && post.language !== routing.defaultLocale ? `/${post.language}` : '';
  const href = `${languagePrefix}/${collectionSlug}/${post.metadata?.slug?.current}`;

  const category = post.categories?.[0];
  const author = post.authors?.[0];
  // Only use Sanity image if it has a valid asset, otherwise use fallback
  const hasValidImage = post.seo?.image?.asset;
  const image = hasValidImage
    ? post.seo?.image
    : getArticleFallbackImage(post.metadata?.title, post.language);

  const stega = createStegaAttribute({
    id: post._id,
    type: post._type,
  });

  return (
    <article className={getArticleClass(variant, className)}>
      {/* Image Section */}
      <Link
        href={href}
        className={getImageClass(variant)}
        data-sanity={stega.scope('seo.image').toString()}
      >
        <Img
          image={image}
          className="h-full w-full object-cover opacity-90 transition-transform duration-500 group-hover/card:scale-105"
          width={variant === 'large' ? 800 : 600}
          sizes={
            variant === 'large'
              ? '(min-width: 1024px) 66vw, 100vw'
              : variant === 'wide'
                ? '(min-width: 1024px) 50vw, 100vw'
                : '(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 100vw'
          }
          alt={post.metadata?.title}
        />
        {category?.title && (
          <div className="absolute top-4 left-4">
            <span className="inline-flex items-center rounded-full bg-[#1a0b2e]/90 px-3 py-1 text-xs font-bold tracking-wide text-white uppercase backdrop-blur-md shadow-sm">
              {category.title}
            </span>
          </div>
        )}
      </Link>

      {/* Content Section */}
      <div className={cn('flex flex-1 flex-col', variant === 'large' ? 'p-6' : 'p-5')}>
        <h3
          className={cn(
            'mb-3 font-serif font-bold leading-snug text-slate-900 transition-colors group-hover/card:text-purple-500 dark:text-white dark:group-hover/card:text-purple-300',
            variant === 'large' ? 'text-2xl' : 'text-xl'
          )}
          data-sanity={stega.scope('metadata.title').toString()}
        >
          <Link href={href}>{post.metadata?.title}</Link>
        </h3>
        <p
          className="mb-4 flex-1 text-base leading-relaxed text-slate-600 line-clamp-3 dark:text-slate-400"
          data-sanity={stega.scope('seo.description').toString()}
        >
          {post.seo?.description}
        </p>

        <div className="mt-auto flex items-center gap-4 border-t border-slate-100 pt-4 dark:border-slate-700/50">
          {author && <AuthorCard author={author} />}
          <div className="ml-auto flex shrink-0 items-center gap-2 whitespace-nowrap text-xs font-medium tracking-wide text-slate-400">
            <DateDisplay
              value={post.publishDate}
              data-sanity={stega.scope('publishDate').toString()}
            />
            <ReadTimeDisplay readTime={post.readTime} />
          </div>
        </div>
      </div>
    </article>
  );
}
