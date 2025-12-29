import Link from 'next/link';
import { createDataAttribute } from 'next-sanity';
import resolveUrl from '@/lib/resolveUrl';
import { cn } from '@/lib/utils';
import { Date as DateDisplay, Img } from '@/ui/base';

export default function BlogHero({
  featuredPost,
  recentPost,
  popularPost,
}: {
  featuredPost: Sanity.BlogPost;
  recentPost?: Sanity.BlogPost;
  popularPost?: Sanity.BlogPost;
}) {
  if (!featuredPost) return null;

  const featuredHref = resolveUrl(
    { ...featuredPost, metadata: featuredPost.metadata } as Sanity.PageBase,
    { base: false }
  );

  const stega = createDataAttribute({
    id: featuredPost._id,
    type: featuredPost._type,
  });

  return (
    <section
      className="relative overflow-hidden bg-[#1a0b2e] pb-12 pt-28 text-white lg:pb-16 lg:pt-32"
      data-theme="dark"
    >
      {/* Background gradients */}
      <div className="pointer-events-none absolute inset-0 opacity-10">
        <div className="animate-blob absolute -top-24 -left-24 h-96 w-96 rounded-full bg-purple-600 blur-3xl mix-blend-multiply filter" />
        <div className="animation-delay-2000 absolute top-0 -right-4 h-96 w-96 rounded-full bg-indigo-600 blur-3xl mix-blend-multiply filter" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start gap-8 lg:flex-row lg:items-center lg:gap-16">
          {/* Main Feature */}
          <div className="flex flex-col items-start space-y-4 lg:w-5/12">
            <span className="inline-block rounded-full border border-white/10 bg-white/10 px-2.5 py-1 text-[10px] font-bold tracking-widest text-purple-200 uppercase backdrop-blur-sm">
              Featured Insight
            </span>
            <h1
              className="font-serif text-3xl font-bold leading-tight tracking-tight text-white md:text-4xl lg:text-5xl"
              data-sanity={stega.scope('metadata.title').toString()}
            >
              <Link href={featuredHref} className="hover:text-purple-200 transition-colors">
                {featuredPost.metadata?.title}
              </Link>
            </h1>
            <p
              className="max-w-lg text-base leading-relaxed text-slate-300 md:text-lg"
              data-sanity={stega.scope('seo.description').toString()}
            >
              {featuredPost.seo?.description}
            </p>
            <div className="flex items-center gap-3 pt-2">
              {featuredPost.authors?.[0] && (
                <>
                  <Img
                    className="h-8 w-8 rounded-full border-2 border-[#1a0b2e] ring-2 ring-[#f59e0b]"
                    image={featuredPost.authors[0].image}
                    width={32}
                    height={32}
                    alt={featuredPost.authors[0].name}
                    data-sanity={createDataAttribute({
                      id: featuredPost.authors[0]._id,
                      type: featuredPost.authors[0]._type,
                    })
                      .scope('image')
                      .toString()}
                  />
                  <div className="flex flex-col">
                    <span
                      className="text-sm font-medium text-white"
                      data-sanity={createDataAttribute({
                        id: featuredPost.authors[0]._id,
                        type: featuredPost.authors[0]._type,
                      })
                        .scope('name')
                        .toString()}
                    >
                      {featuredPost.authors[0].name}
                    </span>
                    <span className="text-[10px] tracking-wide text-slate-400 uppercase">
                      <DateDisplay
                        value={featuredPost.publishDate}
                        data-sanity={stega.scope('publishDate').toString()}
                      />
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Divider */}
          <div className="hidden h-40 w-px bg-gradient-to-b from-transparent via-slate-700 to-transparent lg:block" />

          {/* Sidebar Posts */}
          <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:w-7/12">
            {recentPost && (
              <SidebarCard
                post={recentPost}
                label="Recent"
                labelColor="text-[#f59e0b]"
                hoverColor="group-hover:text-[#f59e0b]"
              />
            )}
            {popularPost && (
              <SidebarCard
                post={popularPost}
                label="Popular"
                labelColor="text-indigo-300"
                hoverColor="group-hover:text-purple-300"
                borderColor="hover:border-purple-500/30"
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function SidebarCard({
  post,
  label,
  labelColor,
  hoverColor,
  borderColor = 'hover:border-[#f59e0b]',
}: {
  post: Sanity.BlogPost;
  label: string;
  labelColor: string;
  hoverColor: string;
  borderColor?: string;
}) {
  const href = resolveUrl({ ...post, metadata: post.metadata } as Sanity.PageBase, { base: false });

  const stega = createDataAttribute({
    id: post._id,
    type: post._type,
  });

  return (
    <Link
      href={href}
      className={cn(
        'group block rounded-xl border border-white/5 bg-white/5 p-4 transition-all duration-300 hover:bg-white/10',
        borderColor
      )}
      data-sanity={stega.scope('metadata.title').toString()}
    >
      <span className={cn('mb-2 block text-xs font-semibold tracking-wider uppercase', labelColor)}>
        {label}
      </span>
      <h3
        className={cn(
          'font-serif font-semibold text-white transition-colors line-clamp-2',
          hoverColor
        )}
      >
        {post.metadata?.title}
      </h3>
      <p
        className="mt-2 text-sm text-slate-400 line-clamp-2"
        data-sanity={stega.scope('seo.description').toString()}
      >
        {post.seo?.description}
      </p>
    </Link>
  );
}
