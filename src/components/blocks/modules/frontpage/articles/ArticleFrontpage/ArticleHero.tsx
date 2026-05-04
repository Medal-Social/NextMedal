import AuthorCard from '@/components/blocks/modules/frontpage/articles/AuthorCard';
import { Date as DateDisplay } from '@/components/blocks/objects/core';
import { Link } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';
import { cn } from '@/lib/utils/index';
import { createStegaAttribute } from '@/sanity/lib/client';

interface ArticleHeroTranslations {
  featuredInsight: string;
  recent: string;
  popular: string;
}

export default function ArticleHero({
  featuredPost,
  recentPost,
  popularPost,
  collectionSlug,
  translations,
}: {
  featuredPost: Sanity.CollectionArticlePost;
  recentPost?: Sanity.CollectionArticlePost;
  popularPost?: Sanity.CollectionArticlePost;
  collectionSlug: string;
  translations: ArticleHeroTranslations;
}) {
  const t = translations;
  if (!featuredPost) return null;

  // Build URL using the actual collection slug from site settings
  const languagePrefix =
    featuredPost.language && featuredPost.language !== routing.defaultLocale
      ? `/${featuredPost.language}`
      : '';
  const featuredHref = `${languagePrefix}/${collectionSlug}/${featuredPost.metadata?.slug?.current}`;

  const stega = createStegaAttribute({
    id: featuredPost._id,
    type: featuredPost._type,
  });

  return (
    <section
      className="relative overflow-hidden bg-[#1a0b2e] pt-28 pb-12 text-white lg:pt-32 lg:pb-16"
      data-theme="dark"
    >
      {/* Background gradients */}
      <div className="pointer-events-none absolute inset-0 opacity-10">
        <div className="absolute -top-24 -left-24 h-96 w-96 animate-blob rounded-full bg-purple-600 mix-blend-multiply blur-3xl filter" />
        <div className="animation-delay-2000 absolute top-0 -right-4 h-96 w-96 rounded-full bg-indigo-600 mix-blend-multiply blur-3xl filter" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start gap-8 lg:flex-row lg:items-center lg:gap-16">
          {/* Main Feature */}
          <div className="flex flex-col items-start space-y-4 lg:w-5/12">
            <span className="inline-block rounded-full border border-white/10 bg-white/10 px-2.5 py-1 font-bold text-[10px] text-purple-200 uppercase tracking-widest backdrop-blur-sm">
              {t.featuredInsight}
            </span>
            <h1
              className="font-bold font-serif text-3xl text-white leading-tight tracking-tight md:text-4xl lg:text-5xl"
              data-sanity={stega.scope('metadata.title').toString()}
            >
              <Link href={featuredHref} className="transition-colors hover:text-purple-200">
                {featuredPost.metadata?.title}
              </Link>
            </h1>
            <p
              className="max-w-lg text-base text-slate-300 leading-relaxed md:text-lg"
              data-sanity={stega.scope('seo.description').toString()}
            >
              {featuredPost.seo?.description}
            </p>
            <div className="flex items-center gap-2 pt-2 text-slate-400 text-sm">
              {featuredPost.authors?.[0] && (
                <>
                  <AuthorCard author={featuredPost.authors[0]} variant="dark" />
                  <span>·</span>
                </>
              )}
              <DateDisplay
                value={featuredPost.publishDate}
                data-sanity={stega.scope('publishDate').toString()}
              />
            </div>
          </div>

          {/* Divider */}
          <div className="hidden h-40 w-px bg-gradient-to-b from-transparent via-slate-700 to-transparent lg:block" />

          {/* Sidebar Posts */}
          <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:w-7/12">
            {recentPost && (
              <SidebarCard
                post={recentPost}
                collectionSlug={collectionSlug}
                label={t.recent}
                labelColor="text-cyan-400"
                hoverColor="group-hover:text-cyan-400"
              />
            )}
            {popularPost && (
              <SidebarCard
                post={popularPost}
                collectionSlug={collectionSlug}
                label={t.popular}
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
  collectionSlug,
  label,
  labelColor,
  hoverColor,
  borderColor = 'hover:border-cyan-500/50',
}: {
  post: Sanity.CollectionArticlePost;
  collectionSlug: string;
  label: string;
  labelColor: string;
  hoverColor: string;
  borderColor?: string;
}) {
  // Build URL using the actual collection slug from site settings
  const languagePrefix =
    post.language && post.language !== routing.defaultLocale ? `/${post.language}` : '';
  const href = `${languagePrefix}/${collectionSlug}/${post.metadata?.slug?.current}`;

  const stega = createStegaAttribute({
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
      <span className={cn('mb-2 block font-semibold text-xs uppercase tracking-wider', labelColor)}>
        {label}
      </span>
      <h3
        className={cn(
          'line-clamp-2 font-semibold font-serif text-white transition-colors',
          hoverColor
        )}
      >
        {post.metadata?.title}
      </h3>
      <p
        className="mt-2 line-clamp-2 text-slate-400 text-sm"
        data-sanity={stega.scope('seo.description').toString()}
      >
        {post.seo?.description}
      </p>
    </Link>
  );
}
