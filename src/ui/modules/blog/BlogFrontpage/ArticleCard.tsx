import { Clock } from 'lucide-react';
import Link from 'next/link';
import { createDataAttribute } from 'next-sanity';
import resolveUrl from '@/lib/resolveUrl';
import { cn } from '@/lib/utils';
import { Date as DateDisplay, Img } from '@/ui/base';

interface ArticleCardProps {
  post: Sanity.BlogPost;
  variant?: 'large' | 'wide' | 'standard' | 'horizontal';
  className?: string;
}

type CardVariant = ArticleCardProps['variant'];

// Get fallback image for posts without an image
function getFallbackImage(title?: string, categoryTitle?: string) {
  return {
    src: `/api/og/blog-fallback?title=${encodeURIComponent(
      (title || '').slice(0, 100)
    )}&category=${encodeURIComponent(categoryTitle || '')}`,
    alt: title || '',
    width: 1200,
    height: 630,
  };
}

// Get image container classes based on variant
function getImageClass(variant: CardVariant) {
  const baseClass = 'relative overflow-hidden';
  const variantClasses: Record<NonNullable<CardVariant>, string> = {
    large: 'h-72 lg:h-96 bg-gradient-to-br from-indigo-300 to-purple-400',
    wide: 'h-56 bg-gradient-to-br from-orange-200 to-[#f59e0b]',
    standard: 'h-48 bg-gradient-to-br from-cyan-300 to-blue-400',
    horizontal:
      'h-48 w-full shrink-0 bg-gradient-to-br from-cyan-300 to-blue-400 md:h-auto md:w-72 lg:w-96',
  };
  return cn(baseClass, variantClasses[variant || 'standard']);
}

// Get article container classes based on variant
function getArticleClass(variant: CardVariant, className?: string) {
  return cn(
    'group flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] dark:border-slate-700 dark:bg-slate-800/50 dark:shadow-none',
    variant === 'large' && 'md:col-span-2 md:row-span-2',
    variant === 'wide' && 'md:col-span-2',
    variant === 'horizontal' && 'md:flex-row',
    className
  );
}

// Create data attribute for author fields
function getAuthorDataAttribute(author: Sanity.Person, scope: string) {
  if (!author._id || !author._type) return undefined;
  return createDataAttribute({ id: author._id, type: author._type }).scope(scope).toString();
}

// Author avatar and name component
function AuthorInfo({ author }: { author: Sanity.Person }) {
  return (
    <div className="flex items-center gap-3">
      {author.image && (
        <Img
          image={author.image}
          className="h-8 w-8 rounded-full ring-1 ring-slate-200 dark:ring-slate-700"
          width={32}
          height={32}
          alt={author.name}
          data-sanity={getAuthorDataAttribute(author, 'image')}
        />
      )}
      {author.name && (
        <span
          className="text-sm font-medium text-slate-700 dark:text-slate-300"
          data-sanity={getAuthorDataAttribute(author, 'name')}
        >
          {author.name}
        </span>
      )}
    </div>
  );
}

// Read time display component
function ReadTimeDisplay({ readTime }: { readTime?: number }) {
  if (!readTime) return null;
  return (
    <>
      <span>·</span>
      <span className="inline-flex items-center gap-1">
        <Clock className="h-3 w-3" />
        {readTime} min
      </span>
    </>
  );
}

export default function ArticleCard({ post, variant = 'standard', className }: ArticleCardProps) {
  const href = resolveUrl({ ...post, metadata: post.metadata } as Sanity.PageBase, { base: false });
  const category = post.categories?.[0];
  const author = post.authors?.[0];
  const image = post.metadata?.image || getFallbackImage(post.metadata?.title, category?.title);

  const stega = createDataAttribute({
    id: post._id,
    type: post._type,
  });

  return (
    <article className={getArticleClass(variant, className)}>
      {/* Image Section */}
      <div
        className={getImageClass(variant)}
        data-sanity={stega.scope('metadata.image').toString()}
      >
        <Img
          image={image}
          className="h-full w-full object-cover opacity-90 transition-transform duration-500 group-hover:scale-105"
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
      </div>

      {/* Content Section */}
      <div className={cn('flex flex-1 flex-col', variant === 'large' ? 'p-6' : 'p-5')}>
        <h3
          className={cn(
            'mb-3 font-serif font-bold leading-snug text-slate-900 transition-colors group-hover:text-[#f59e0b] dark:text-white',
            variant === 'large' ? 'text-2xl' : 'text-xl'
          )}
          data-sanity={stega.scope('metadata.title').toString()}
        >
          <Link href={href}>{post.metadata?.title}</Link>
        </h3>
        <p
          className="mb-4 flex-1 text-base leading-relaxed text-slate-600 line-clamp-3 dark:text-slate-400"
          data-sanity={stega.scope('metadata.description').toString()}
        >
          {post.metadata?.description}
        </p>

        <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-700/50">
          {author && <AuthorInfo author={author} />}
          {!author && <div />}
          <div className="flex items-center gap-2 text-xs font-medium tracking-wide text-slate-400">
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
