import { Clock } from 'lucide-react';
import Link from 'next/link';
import { createDataAttribute } from 'next-sanity';
import resolveUrl from '@/lib/resolveUrl';
import { cn } from '@/lib/utils';
import DateDisplay from '@/ui/Date';
import { Img } from '@/ui/Img';

interface ArticleCardProps {
  post: Sanity.BlogPost;
  variant?: 'large' | 'wide' | 'standard' | 'horizontal';
  className?: string;
}

export default function ArticleCard({ post, variant = 'standard', className }: ArticleCardProps) {
  const href = resolveUrl({ ...post, metadata: post.metadata } as Sanity.PageBase, { base: false });
  const category = post.categories?.[0];

  const fallbackImage = !post.metadata?.image
    ? {
        src: `/api/og/blog-fallback?title=${encodeURIComponent(post.metadata?.title || '')}&category=${encodeURIComponent(
          category?.title || ''
        )}`,
        alt: post.metadata?.title || '',
        width: 1200,
        height: 630,
      }
    : undefined;

  const stega = createDataAttribute({
    id: post._id,
    type: post._type,
  });

  const imageClass = cn(
    'relative overflow-hidden',
    variant === 'large' && 'h-72 lg:h-96 bg-gradient-to-br from-indigo-300 to-purple-400',
    variant === 'wide' && 'h-56 bg-gradient-to-br from-orange-200 to-[#f59e0b]',
    variant === 'standard' && 'h-48 bg-gradient-to-br from-cyan-300 to-blue-400',
    variant === 'horizontal' &&
      'h-48 w-full shrink-0 bg-gradient-to-br from-cyan-300 to-blue-400 md:h-auto md:w-72 lg:w-96'
  );

  return (
    <article
      className={cn(
        'group flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] dark:border-slate-700 dark:bg-slate-800/50 dark:shadow-none',
        variant === 'large' && 'md:col-span-2 md:row-span-2',
        variant === 'wide' && 'md:col-span-2',
        variant === 'horizontal' && 'md:flex-row',
        className
      )}
    >
      {/* Image Section */}
      <div className={imageClass} data-sanity={stega.scope('metadata.image').toString()}>
        <Img
          image={post.metadata?.image || fallbackImage}
          className="h-full w-full object-cover opacity-90 transition-transform duration-500 group-hover:scale-105"
          width={variant === 'large' ? 800 : 600}
          alt={post.metadata?.title}
        />
        {category && (
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
          <div className="flex items-center gap-3">
            {post.authors?.[0]?.image && (
              <Img
                image={post.authors[0].image}
                className="h-8 w-8 rounded-full ring-1 ring-slate-200 dark:ring-slate-700"
                width={32}
                height={32}
                alt={post.authors[0].name}
                data-sanity={
                  post.authors[0]._id && post.authors[0]._type
                    ? createDataAttribute({
                        id: post.authors[0]._id,
                        type: post.authors[0]._type,
                      })
                        .scope('image')
                        .toString()
                    : undefined
                }
              />
            )}
            {post.authors?.[0]?.name && (
              <span
                className="text-sm font-medium text-slate-700 dark:text-slate-300"
                data-sanity={
                  post.authors[0]._id && post.authors[0]._type
                    ? createDataAttribute({
                        id: post.authors[0]._id,
                        type: post.authors[0]._type,
                      })
                        .scope('name')
                        .toString()
                    : undefined
                }
              >
                {post.authors[0].name}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs font-medium tracking-wide text-slate-400">
            <DateDisplay
              value={post.publishDate}
              data-sanity={stega.scope('publishDate').toString()}
            />
            {post.readTime && (
              <>
                <span>·</span>
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {post.readTime} min
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
