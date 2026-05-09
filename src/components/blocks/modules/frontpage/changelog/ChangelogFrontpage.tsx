/**
 * Changelog Frontpage Module Component
 * @version 1.0.0
 * @lastUpdated 2025-12-30
 * @description Displays a list of changelog entries (release notes) from a collection.
 * List-only display - no individual detail pages.
 */

import { Calendar, ExternalLink, History, Rss } from 'lucide-react';
import { groq, stegaClean } from 'next-sanity';
import { Suspense } from 'react';
import SharedPortableText from '@/components/blocks/modules/SharedPortableText';
import { Date as DateDisplay } from '@/components/blocks/objects/core';
import { EmptyState } from '@/components/ui/empty-state';
import { Section } from '@/components/ui/section';
import { Link } from '@/i18n/navigation';
import { getCollectionSlugWithFallback } from '@/lib/collections/registry';
import moduleProps from '@/lib/sanity/module-props';
import { cn } from '@/lib/utils/index';
import { fetchSanityLive } from '@/sanity/lib/live';

interface ChangelogFrontpageProps extends Sanity.ChangelogFrontpage {
  collectionSlug?: string;
  locale?: string;
}

// Category labels and colors
const categoryConfig: Record<
  string,
  { label: string; emoji: string; color: string; bgColor: string }
> = {
  features: {
    label: 'New Features',
    emoji: '✨',
    color: 'text-emerald-700 dark:text-emerald-400',
    bgColor: 'bg-emerald-50 dark:bg-emerald-950/30',
  },
  improvements: {
    label: 'Improvements',
    emoji: '🔧',
    color: 'text-blue-700 dark:text-blue-400',
    bgColor: 'bg-blue-50 dark:bg-blue-950/30',
  },
  bugfixes: {
    label: 'Bug Fixes',
    emoji: '🐛',
    color: 'text-amber-700 dark:text-amber-400',
    bgColor: 'bg-amber-50 dark:bg-amber-950/30',
  },
  security: {
    label: 'Security',
    emoji: '🔒',
    color: 'text-red-700 dark:text-red-400',
    bgColor: 'bg-red-50 dark:bg-red-950/30',
  },
  breaking: {
    label: 'Breaking Changes',
    emoji: '⚠️',
    color: 'text-orange-700 dark:text-orange-400',
    bgColor: 'bg-orange-50 dark:bg-orange-950/30',
  },
  docs: {
    label: 'Documentation',
    emoji: '📝',
    color: 'text-purple-700 dark:text-purple-400',
    bgColor: 'bg-purple-50 dark:bg-purple-950/30',
  },
  deprecated: {
    label: 'Deprecated',
    emoji: '🗑️',
    color: 'text-gray-700 dark:text-gray-400',
    bgColor: 'bg-gray-50 dark:bg-gray-950/30',
  },
};

// Release type badges
const releaseTypeBadge: Record<string, { label: string; color: string }> = {
  major: { label: 'Major', color: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200' },
  minor: {
    label: 'Minor',
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200',
  },
  patch: {
    label: 'Patch',
    color: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200',
  },
  beta: {
    label: 'Beta',
    color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-200',
  },
  alpha: {
    label: 'Alpha',
    color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200',
  },
  hotfix: {
    label: 'Hotfix',
    color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-200',
  },
};

// Fetch changelog entries
async function fetchChangelogEntries(
  collectionSlug: string,
  locale: string,
  options: {
    limit?: number;
  }
) {
  const { limit = 0 } = options;

  return await fetchSanityLive<Sanity.CollectionChangelog[]>({
    query: groq`
      *[
        _type == 'collection.changelog' &&
        collection->metadata.slug.current == $collectionSlug &&
        (language == $locale || language == null)
      ]|order(
        publishDate desc
      )${limit > 0 ? `[0...${limit}]` : ''}{
        _id,
        _type,
        publishDate,
        version,
        releaseType,
        summary,
        changes[] {
          _key,
          category,
          items[] {
            _key,
            description,
            link
          }
        },
        metadata {
          title,
          "slug": { "current": slug.current }
        },
        collection->{
          metadata { slug }
        }
      }
    `,
    params: {
      collectionSlug,
      locale,
    },
  });
}

// Entry badges component
function EntryBadges({
  version,
  releaseInfo,
  compact = false,
}: {
  version?: string;
  releaseInfo: { label: string; color: string } | null;
  compact?: boolean;
}) {
  const badgeClass = compact ? 'px-2 py-0.5 text-xs rounded' : 'px-2.5 py-1 text-xs rounded-full';
  const versionClass = compact
    ? 'font-mono text-lg font-bold'
    : 'font-mono text-xl font-bold text-foreground';

  return (
    <>
      {version && <span className={versionClass}>{version}</span>}
      {releaseInfo && (
        <span className={cn(badgeClass, 'font-medium', releaseInfo.color)}>
          {releaseInfo.label}
        </span>
      )}
    </>
  );
}

// Change category component
function ChangeCategory({
  category,
}: {
  category: {
    _key: string;
    category: string;
    items?: Array<{ _key: string; description: string; link?: string }>;
  };
}) {
  const config = categoryConfig[category.category] || categoryConfig.features;

  return (
    <div key={category._key}>
      <h4
        className={cn('mb-2 inline-flex items-center gap-1.5 font-semibold text-sm', config.color)}
      >
        <span>{config.emoji}</span>
        {config.label}
      </h4>
      {category.items && category.items.length > 0 && (
        <ul className="space-y-1.5">
          {category.items.map((item) => (
            <li key={item._key} className="flex items-start gap-2 text-muted-foreground text-sm">
              <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-current" />
              <span>{item.description}</span>
              {item.link && (
                <a
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="View related issue or documentation"
                  className="ml-1 inline-flex items-center text-primary hover:underline"
                >
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// Compact layout entry
function CompactEntry({ entry }: { entry: Sanity.CollectionChangelog }) {
  const releaseInfo = entry.releaseType ? releaseTypeBadge[entry.releaseType] : null;

  return (
    <div className="border-border border-b py-4 first:pt-0 last:border-0">
      <div className="mb-2 flex flex-wrap items-center gap-3">
        <EntryBadges version={entry.version} releaseInfo={releaseInfo} compact />
        <span className="text-muted-foreground text-sm">
          <DateDisplay value={entry.publishDate} />
        </span>
      </div>
      {(entry.metadata?.title || entry.summary) && (
        <p className="text-muted-foreground text-sm">{entry.summary || entry.metadata?.title}</p>
      )}
    </div>
  );
}

// Full layout entry (timeline or cards)
function FullEntry({
  entry,
  layout,
}: {
  entry: Sanity.CollectionChangelog;
  layout: 'timeline' | 'cards';
}) {
  const releaseInfo = entry.releaseType ? releaseTypeBadge[entry.releaseType] : null;

  return (
    <article
      className={cn(
        layout === 'timeline' && 'relative border-border border-l-2 pb-10 pl-8 last:pb-0',
        layout === 'cards' && 'rounded-xl border bg-card p-6 shadow-sm'
      )}
    >
      {layout === 'timeline' && (
        <div className="absolute left-0 h-4 w-4 -translate-x-1/2 rounded-full border-4 border-background bg-primary" />
      )}

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <EntryBadges version={entry.version} releaseInfo={releaseInfo} />
      </div>

      <div className="mb-4">
        {entry.metadata?.title && (
          <h3 className="mb-1 font-semibold text-foreground text-lg">{entry.metadata.title}</h3>
        )}
        <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
          <Calendar className="h-4 w-4" />
          <DateDisplay value={entry.publishDate} />
        </div>
      </div>

      {entry.summary && <p className="mb-4 text-muted-foreground">{entry.summary}</p>}

      {entry.changes && entry.changes.length > 0 && (
        <div className="space-y-4">
          {entry.changes.map((category) => (
            <ChangeCategory key={category._key} category={category} />
          ))}
        </div>
      )}
    </article>
  );
}

// Single changelog entry component
function ChangelogEntry({
  entry,
  layout,
}: {
  entry: Sanity.CollectionChangelog;
  layout: 'timeline' | 'cards' | 'compact';
}) {
  if (layout === 'compact') {
    return <CompactEntry entry={entry} />;
  }
  return <FullEntry entry={entry} layout={layout} />;
}

// Group entries by year
function groupByYear(
  entries: Sanity.CollectionChangelog[]
): Record<string, Sanity.CollectionChangelog[]> {
  return entries.reduce(
    (groups, entry) => {
      const year = new Date(entry.publishDate).getFullYear().toString();
      if (!groups[year]) groups[year] = [];
      groups[year].push(entry);
      return groups;
    },
    {} as Record<string, Sanity.CollectionChangelog[]>
  );
}

// Loading skeleton
function ListSkeleton({ count = 3, layout }: { count?: number; layout: string }) {
  return (
    <div className={cn(layout === 'timeline' && 'border-border border-l-2 pl-8')}>
      {Array.from({ length: count }).map((_, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: skeleton placeholder, no semantic identity
        <div key={`skeleton-${i}`} className="animate-pulse pb-10">
          <div className="mb-4 flex gap-3">
            <div className="h-6 w-16 rounded bg-muted" />
            <div className="h-6 w-12 rounded-full bg-muted" />
          </div>
          <div className="mb-2 h-5 w-48 rounded bg-muted" />
          <div className="mb-4 h-4 w-24 rounded bg-muted" />
          <div className="space-y-2">
            <div className="h-4 w-full rounded bg-muted" />
            <div className="h-4 w-3/4 rounded bg-muted" />
          </div>
        </div>
      ))}
    </div>
  );
}

// Entries list component
function ChangelogList({
  entries,
  layout,
  groupByYear: shouldGroup,
}: {
  entries: Sanity.CollectionChangelog[];
  layout: 'timeline' | 'cards' | 'compact';
  groupByYear?: boolean;
}) {
  if (!entries || entries.length === 0) {
    return (
      <EmptyState
        icon={History}
        title="No changelog entries yet"
        description="No changelog entries have been published in this collection yet."
      />
    );
  }

  if (shouldGroup && layout !== 'compact') {
    const grouped = groupByYear(entries);
    const years = Object.keys(grouped).sort((a, b) => Number(b) - Number(a));

    return (
      <div className="space-y-12">
        {years.map((year) => (
          <div key={year}>
            <h2 className="sticky top-20 z-10 mb-6 bg-background/95 py-2 font-bold text-2xl text-foreground backdrop-blur">
              {year}
            </h2>
            <div className={cn(layout === 'cards' && 'grid gap-6 md:grid-cols-2')}>
              {grouped[year].map((entry) => (
                <ChangelogEntry key={entry._id} entry={entry} layout={layout} />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      className={cn(
        layout === 'cards' && 'grid gap-6 md:grid-cols-2',
        layout === 'compact' && 'divide-y divide-border'
      )}
    >
      {entries.map((entry) => (
        <ChangelogEntry key={entry._id} entry={entry} layout={layout} />
      ))}
    </div>
  );
}

export default async function ChangelogFrontpage({
  intro,
  layout = 'timeline',
  groupByYear = true,
  limit = 0,
  showRssLink,
  collectionSlug: providedSlug,
  locale = 'en',
  ...props
}: ChangelogFrontpageProps) {
  // Self-determine collection slug from site settings if not provided
  let collectionSlug = providedSlug;

  if (!collectionSlug) {
    collectionSlug = getCollectionSlugWithFallback('collection.changelog', locale);
    if (!collectionSlug) {
      return (
        <Section className="space-y-8" {...moduleProps(props)}>
          <div className="py-12 text-center text-muted-foreground">
            <p>Changelog collection not configured for this language.</p>
            <p className="mt-2 text-sm">Configure the changelog frontpage in site settings.</p>
          </div>
        </Section>
      );
    }
  }

  const entries = await fetchChangelogEntries(collectionSlug, locale, {
    limit,
  });

  const cleanLayout = stegaClean(layout) as 'timeline' | 'cards' | 'compact';

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

      <Suspense fallback={<ListSkeleton count={3} layout={cleanLayout} />}>
        <ChangelogList entries={entries} layout={cleanLayout} groupByYear={groupByYear} />
      </Suspense>
    </Section>
  );
}
