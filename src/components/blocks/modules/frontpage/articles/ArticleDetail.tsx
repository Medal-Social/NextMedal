/**
 * Article Detail Component
 * @version 1.0.0
 * @lastUpdated 2025-12-30
 * @description Renders a collection article detail page with breadcrumbs, hero image, and sidebar
 */

import { Calendar } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { Fragment } from 'react';
import Content from '@/components/blocks/modules/content/RichtextModule/Content';
import AuthorCard from '@/components/blocks/modules/frontpage/articles/AuthorCard';
import MobileSidebar from '@/components/blocks/modules/frontpage/articles/MobileSidebar';
import ReadTime from '@/components/blocks/modules/frontpage/articles/ReadTime';
import Sidebar from '@/components/blocks/modules/frontpage/articles/Sidebar';
import SocialShare from '@/components/blocks/modules/frontpage/articles/SocialShare';
import { Date as DateDisplay, Img } from '@/components/blocks/objects/core';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { routing } from '@/i18n/routing';
import { getArticleFallbackImage } from '@/lib/utils/article-helpers';
import { createStegaAttribute } from '@/sanity/lib/client';

interface ArticleDetailProps {
  post: Sanity.CollectionArticlePost;
  collectionSlug: string;
}

// Build breadcrumbs from post data
function buildBreadcrumbs(
  post: Sanity.CollectionArticlePost,
  collectionSlug: string
): Array<{ label: string; href: string }> {
  const collectionTitle = post.collection?.metadata?.title || collectionSlug;
  const languagePrefix =
    post.language && post.language !== routing.defaultLocale ? `/${post.language}` : '';
  const crumbs = [{ label: collectionTitle, href: `${languagePrefix}/${collectionSlug}` }];

  if (post.categories?.[0]) {
    crumbs.push({
      label: post.categories[0].title,
      href: `${languagePrefix}/${collectionSlug}?category=${post.categories[0].slug?.current}`,
    });
  }

  return crumbs;
}

// Breadcrumbs component
function PostBreadcrumbs({
  crumbs,
  currentTitle,
  homeLabel,
}: {
  crumbs: Array<{ label: string; href: string }>;
  currentTitle?: string;
  homeLabel: string;
}) {
  return (
    <Breadcrumb className="mb-6 font-medium text-muted-foreground">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/">{homeLabel}</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />

        {crumbs.map((crumb) => (
          <Fragment key={crumb.label}>
            <BreadcrumbItem>
              <BreadcrumbLink href={crumb.href}>{crumb.label}</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
          </Fragment>
        ))}

        <BreadcrumbItem>
          <BreadcrumbPage>{currentTitle}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}

// Post header section
function PostHeader({
  post,
  collectionSlug,
  stega,
  homeLabel,
}: {
  post: Sanity.CollectionArticlePost;
  collectionSlug: string;
  stega: ReturnType<typeof createStegaAttribute>;
  homeLabel: string;
}) {
  const crumbs = buildBreadcrumbs(post, collectionSlug);

  return (
    <section className="bg-background pt-24 md:pt-32 pb-8 border-b border-border relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <PostBreadcrumbs
          crumbs={crumbs}
          currentTitle={post.metadata?.title}
          homeLabel={homeLabel}
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          <div className="lg:col-span-8">
            <h1
              className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-foreground leading-tight mb-6"
              data-sanity={stega.scope('metadata.title').toString()}
            >
              {post.metadata?.title}
            </h1>

            <PostMeta post={post} stega={stega} />
          </div>
        </div>
      </div>
    </section>
  );
}

// Post metadata (author, date, read time)
function PostMeta({
  post,
  stega,
}: {
  post: Sanity.CollectionArticlePost;
  stega: ReturnType<typeof createStegaAttribute>;
}) {
  const authors = post.authors as Sanity.Person[] | undefined;

  return (
    <div className="flex flex-wrap items-center gap-3 text-muted-foreground text-sm">
      {authors?.map((author, index) => (
        <Fragment key={author._id || index}>
          <AuthorCard author={author} />
          {index < authors.length - 1 && <span className="text-muted-foreground/50">&</span>}
        </Fragment>
      ))}

      {authors?.length ? <span className="text-muted-foreground/50">·</span> : null}

      <div className="flex items-center gap-1.5">
        <Calendar className="w-4 h-4" />
        <DateDisplay value={post.publishDate} data-sanity={stega.scope('publishDate').toString()} />
      </div>

      {post.readTime && (
        <>
          <span className="text-muted-foreground/50">·</span>
          <ReadTime value={post.readTime} />
        </>
      )}
    </div>
  );
}

// Hero image component
function HeroImage({
  post,
  stega,
}: {
  post: Sanity.CollectionArticlePost;
  stega: ReturnType<typeof createStegaAttribute>;
}) {
  if (!post.seo?.image && !post.metadata?.title) return null;

  const fallbackImage = getArticleFallbackImage(post.metadata?.title, post.language);

  return (
    <div
      className="w-full rounded-xl overflow-hidden shadow-md mb-8 bg-muted aspect-video"
      data-sanity={stega.scope('seo.image').toString()}
    >
      <Img
        image={post.seo?.image || fallbackImage}
        className="w-full h-full object-cover"
        sizes="(max-width: 768px) 100vw, 900px"
        priority
        fetchPriority="high"
        alt={post.metadata?.title || ''}
        unoptimized={!post.seo?.image}
      />
    </div>
  );
}

// Mobile share component
function MobileBottomContent({
  post,
  collectionSlug,
  shareLabel,
}: {
  post: Sanity.CollectionArticlePost;
  collectionSlug: string;
  shareLabel: string;
}) {
  return (
    <div className="lg:hidden mt-12 space-y-12">
      <div className="bg-card rounded-2xl p-6 border shadow-sm">
        <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">
          {shareLabel}
        </h4>
        <SocialShare
          title={post.metadata?.title || ''}
          slug={`${collectionSlug}/${post.metadata?.slug?.current || ''}`}
        />
      </div>
    </div>
  );
}

export default async function ArticleDetail({ post, collectionSlug }: ArticleDetailProps) {
  const t = await getTranslations('article');

  const stega = createStegaAttribute({
    id: post._id,
    type: post._type,
  });

  return (
    <article>
      <PostHeader post={post} collectionSlug={collectionSlug} stega={stega} homeLabel={t('home')} />

      {/* Main Content Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Content Column */}
          <div className="lg:col-span-8">
            <HeroImage post={post} stega={stega} />
            <MobileSidebar headings={post.headings} onThisPageLabel={t('onThisPage')} />

            {post.body && (
              <Content
                value={post.body}
                className="prose prose-slate dark:prose-invert prose-lg max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-a:text-primary prose-img:rounded-xl"
                data-sanity={stega.scope('body').toString()}
              />
            )}

            <MobileBottomContent
              post={post}
              collectionSlug={collectionSlug}
              shareLabel={t('shareArticle')}
            />
          </div>

          {/* Sidebar Column */}
          <div className="hidden lg:block lg:col-span-4 sticky top-24 self-start">
            <Sidebar
              headings={post.headings}
              title={post.metadata?.title || ''}
              slug={`${collectionSlug}/${post.metadata?.slug?.current || ''}`}
              shareLabel={t('shareArticle')}
              onThisPageLabel={t('onThisPage')}
            />
          </div>
        </div>
      </div>
    </article>
  );
}
