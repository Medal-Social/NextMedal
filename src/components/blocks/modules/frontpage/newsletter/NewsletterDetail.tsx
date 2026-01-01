/**
 * Newsletter Detail Component
 * @version 1.0.0
 * @lastUpdated 2025-12-30
 * @description Renders a collection newsletter issue detail page
 */

import { Calendar, Hash } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { Fragment } from 'react';
import Content from '@/components/blocks/modules/content/RichtextModule/Content';
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
import { createStegaAttribute } from '@/sanity/lib/client';

interface NewsletterDetailProps {
  issue: Sanity.CollectionNewsletter;
  collectionSlug: string;
  locale: string;
}

// Build breadcrumbs from issue data
function buildBreadcrumbs(
  issue: Sanity.CollectionNewsletter,
  collectionSlug: string
): Array<{ label: string; href: string }> {
  const collectionTitle = issue.collection?.metadata?.title || collectionSlug;
  return [{ label: collectionTitle, href: `/${collectionSlug}` }];
}

// Breadcrumbs component
function IssueBreadcrumbs({
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

// Issue header section
function IssueHeader({
  issue,
  collectionSlug,
  stega,
  homeLabel,
}: {
  issue: Sanity.CollectionNewsletter;
  collectionSlug: string;
  stega: ReturnType<typeof createStegaAttribute>;
  homeLabel: string;
}) {
  const crumbs = buildBreadcrumbs(issue, collectionSlug);

  return (
    <section className="bg-background pt-24 md:pt-32 pb-8 border-b border-border relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <IssueBreadcrumbs
          crumbs={crumbs}
          currentTitle={issue.metadata?.title}
          homeLabel={homeLabel}
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          <div className="lg:col-span-8">
            <h1
              className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-foreground leading-tight mb-6"
              data-sanity={stega.scope('metadata.title').toString()}
            >
              {issue.metadata?.title}
            </h1>

            <IssueMeta issue={issue} stega={stega} />
          </div>
        </div>
      </div>
    </section>
  );
}

// Issue metadata (issue number, date, read time)
function IssueMeta({
  issue,
  stega,
}: {
  issue: Sanity.CollectionNewsletter;
  stega: ReturnType<typeof createStegaAttribute>;
}) {
  return (
    <div className="flex flex-wrap items-center gap-y-4 gap-x-6 text-muted-foreground text-sm">
      {issue.issueNumber && (
        <div className="flex items-center gap-1.5">
          <Hash className="w-4 h-4" />
          <span data-sanity={stega.scope('issueNumber').toString()}>
            Issue #{issue.issueNumber}
          </span>
        </div>
      )}

      <div className="hidden sm:block w-px h-8 bg-border" />

      <div className="flex items-center gap-1.5">
        <Calendar className="w-4 h-4" />
        <DateDisplay
          value={issue.publishDate}
          data-sanity={stega.scope('publishDate').toString()}
        />
      </div>

      {issue.readTime && (
        <div className="flex items-center gap-1.5">
          <ReadTime value={issue.readTime} />
        </div>
      )}
    </div>
  );
}

// Hero image component
function HeroImage({
  issue,
  stega,
}: {
  issue: Sanity.CollectionNewsletter;
  stega: ReturnType<typeof createStegaAttribute>;
}) {
  if (!issue.seo?.image && !issue.metadata?.title) return null;

  const fallbackImage = {
    src: `/api/og/article-fallback?title=${encodeURIComponent(issue.metadata?.title || '')}&category=${encodeURIComponent(
      issue.issueNumber ? `Issue #${issue.issueNumber}` : 'Newsletter'
    )}`,
    alt: issue.metadata?.title || '',
    width: 1200,
    height: 630,
  };

  return (
    <div
      className="w-full rounded-xl overflow-hidden shadow-md mb-8 bg-muted aspect-video"
      data-sanity={stega.scope('seo.image').toString()}
    >
      <Img
        image={issue.seo?.image || fallbackImage}
        className="w-full h-full object-cover"
        sizes="(max-width: 768px) 100vw, 900px"
        priority
        fetchPriority="high"
        alt={issue.metadata?.title || ''}
        unoptimized={!issue.seo?.image}
      />
    </div>
  );
}

// Mobile share component
function MobileBottomContent({
  issue,
  collectionSlug,
  shareLabel,
}: {
  issue: Sanity.CollectionNewsletter;
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
          title={issue.metadata?.title || ''}
          slug={`${collectionSlug}/${issue.metadata?.slug?.current || ''}`}
        />
      </div>
    </div>
  );
}

export default async function NewsletterDetail({ issue, collectionSlug }: NewsletterDetailProps) {
  const t = await getTranslations('article');

  const stega = createStegaAttribute({
    id: issue._id,
    type: issue._type,
  });

  return (
    <article>
      <IssueHeader
        issue={issue}
        collectionSlug={collectionSlug}
        stega={stega}
        homeLabel={t('home')}
      />

      {/* Main Content Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Content Column */}
          <div className="lg:col-span-8">
            <HeroImage issue={issue} stega={stega} />
            <MobileSidebar headings={issue.headings} onThisPageLabel={t('onThisPage')} />

            {issue.body && (
              <Content
                value={issue.body}
                className="prose prose-slate dark:prose-invert prose-lg max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-a:text-primary prose-img:rounded-xl"
                data-sanity={stega.scope('body').toString()}
              />
            )}

            <MobileBottomContent
              issue={issue}
              collectionSlug={collectionSlug}
              shareLabel={t('shareArticle')}
            />
          </div>

          {/* Sidebar Column */}
          <div className="hidden lg:block lg:col-span-4 sticky top-24 self-start">
            <Sidebar
              headings={issue.headings}
              title={issue.metadata?.title || ''}
              slug={`${collectionSlug}/${issue.metadata?.slug?.current || ''}`}
              shareLabel={t('shareArticle')}
              onThisPageLabel={t('onThisPage')}
            />
          </div>
        </div>
      </div>
    </article>
  );
}
