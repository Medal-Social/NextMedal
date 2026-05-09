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
    <section className="relative border-border border-b bg-background pt-24 pb-8 md:pt-32">
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <PostBreadcrumbs
          crumbs={crumbs}
          currentTitle={post.metadata?.title}
          homeLabel={homeLabel}
        />

        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-8">
            <h1
              className="mb-6 font-bold text-3xl text-foreground leading-tight tracking-tight md:text-4xl lg:text-5xl"
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
        <Calendar className="h-4 w-4" />
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
      className="mb-8 aspect-video w-full overflow-hidden rounded-xl bg-muted shadow-md"
      data-sanity={stega.scope('seo.image').toString()}
    >
      <Img
        image={post.seo?.image || fallbackImage}
        className="h-full w-full object-cover"
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
    <div className="mt-12 space-y-12 lg:hidden">
      <div className="rounded-2xl border bg-card p-6 shadow-sm">
        <h4 className="mb-4 font-bold text-muted-foreground text-xs uppercase tracking-widest">
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
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-12">
          {/* Content Column */}
          <div className="lg:col-span-8">
            <HeroImage post={post} stega={stega} />
            <MobileSidebar headings={post.headings} onThisPageLabel={t('onThisPage')} />

            {post.body && (
              <Content
                value={post.body}
                className="prose prose-slate dark:prose-invert prose-lg max-w-none prose-img:rounded-xl prose-headings:font-bold prose-a:text-primary prose-headings:tracking-tight"
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
          <div className="sticky top-24 hidden self-start lg:col-span-4 lg:block">
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
