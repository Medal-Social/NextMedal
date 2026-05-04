/**
 * Newsletter Frontpage Module Component
 * @version 1.0.0
 * @lastUpdated 2025-12-30
 * @description Displays a list of newsletter issues from a collection.
 * The issues are filtered based on the current page slug (which acts as the collection).
 */

import { Rss } from 'lucide-react';
import { groq, stegaClean } from 'next-sanity';
import { Suspense } from 'react';
import SharedPortableText from '@/components/blocks/modules/SharedPortableText';
import { Section } from '@/components/ui/section';
import { Link } from '@/i18n/navigation';
import { getCollectionSlugWithFallback } from '@/lib/collections/registry';
import moduleProps from '@/lib/sanity/module-props';
import { cn } from '@/lib/utils/index';
import { fetchSanityLive } from '@/sanity/lib/live';
import { IMAGE_QUERY } from '@/sanity/lib/queries';
import NewsletterListPaginated from './NewsletterListPaginated';

interface NewsletterFrontpageProps extends Sanity.NewsletterFrontpage {
  collectionSlug?: string;
  locale?: string;
}

// Fetch collection newsletter issues based on collection slug
async function fetchCollectionNewsletters(
  collectionSlug: string,
  locale: string,
  options: {
    limit?: number;
  }
) {
  const { limit = 12 } = options;

  return await fetchSanityLive<Sanity.CollectionNewsletter[]>({
    query: groq`
      *[
        _type == 'collection.newsletter' &&
        collection->metadata.slug.current == $collectionSlug &&
        language == $locale
      ]|order(
        publishDate desc
      )[0...$limit]{
        _id,
        _type,
        publishDate,
        issueNumber,
        preheader,
        metadata {
          title,
          description,
          "slug": { "current": slug.current }
        },
        seo {
          image { ${IMAGE_QUERY} }
        },
        collection->{
          metadata { slug }
        }
      }
    `,
    params: {
      collectionSlug,
      locale,
      limit,
    },
  });
}

// Loading skeleton
function ListSkeleton({ count = 6, className }: { count?: number; className?: string }) {
  return (
    <ul className={className}>
      {Array.from({ length: count }).map((_, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: skeleton placeholder, no semantic identity
        <li key={`skeleton-${i}`}>
          <div className="animate-pulse rounded-xl border bg-card shadow-sm">
            <div className="aspect-video rounded-t-xl bg-muted" />
            <div className="space-y-3 p-5">
              <div className="flex gap-3">
                <div className="h-4 w-16 rounded bg-muted" />
                <div className="h-4 w-20 rounded bg-muted" />
              </div>
              <div className="h-6 w-3/4 rounded bg-muted" />
              <div className="h-4 w-full rounded bg-muted" />
              <div className="h-4 w-2/3 rounded bg-muted" />
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

export default async function NewsletterFrontpage({
  intro,
  layout = 'grid',
  columns = 3,
  limit = 12,
  showRssLink,
  collectionSlug: providedSlug,
  locale = 'en',
  ...props
}: NewsletterFrontpageProps) {
  // Self-determine collection slug from site settings if not provided
  let collectionSlug = providedSlug;

  if (!collectionSlug) {
    collectionSlug = getCollectionSlugWithFallback('collection.newsletter', locale);
    if (!collectionSlug) {
      return (
        <Section className="space-y-8" {...moduleProps(props)}>
          <div className="py-12 text-center text-muted-foreground">
            <p>Newsletter collection not configured for this language.</p>
            <p className="mt-2 text-sm">Configure the newsletter frontpage in site settings.</p>
          </div>
        </Section>
      );
    }
  }

  // Fetch more newsletters than the page limit to enable pagination
  // The client component will handle pagination
  const fetchLimit = Math.max(limit * 10, 100);
  const newsletters = await fetchCollectionNewsletters(collectionSlug, locale, {
    limit: fetchLimit,
  });

  const cleanLayout = stegaClean(layout);
  const cleanColumns = stegaClean(columns);

  const listClassName = cn(
    'items-stretch gap-x-8 gap-y-12',
    cleanLayout === 'grid' &&
      cn(
        'grid',
        cleanColumns === 2 && 'md:grid-cols-2',
        cleanColumns === 3 && 'md:grid-cols-2 lg:grid-cols-3',
        cleanColumns === 4 && 'md:grid-cols-2 lg:grid-cols-4'
      ),
    cleanLayout === 'list' && 'flex flex-col gap-6',
    cleanLayout === 'carousel' &&
      'carousel max-xl:full-bleed md:overflow-fade-r pb-4 [--size:320px] max-xl:px-4'
  );

  return (
    <Section className="space-y-8" {...moduleProps(props)}>
      {(intro || showRssLink) && (
        <header className="flex flex-wrap items-start justify-between gap-4">
          {intro && (
            <div className="richtext flex-1">
              <SharedPortableText value={intro} />
            </div>
          )}
          {showRssLink && (
            <Link
              href={`/${collectionSlug}/rss.xml`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-muted-foreground text-sm transition-colors hover:text-foreground"
              title="RSS Feed"
            >
              <Rss className="h-4 w-4" />
              <span>RSS Feed</span>
            </Link>
          )}
        </header>
      )}

      <Suspense fallback={<ListSkeleton count={limit} className={listClassName} />}>
        <NewsletterListPaginated
          newsletters={newsletters}
          collectionSlug={collectionSlug}
          className={listClassName}
          itemsPerPage={limit}
        />
      </Suspense>
    </Section>
  );
}
