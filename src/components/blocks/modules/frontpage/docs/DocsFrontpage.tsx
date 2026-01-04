/**
 * Documentation Frontpage Server Component
 * @version 2.0.0
 * @lastUpdated 2025-12-30
 * @description Server component that fetches documentation data and renders DocsFrontpageClient.
 */

import { groq, stegaClean } from 'next-sanity';
import { Suspense } from 'react';
import SharedPortableText from '@/components/blocks/modules/SharedPortableText';
import { Section } from '@/components/ui/section';
import { getCollectionSlugWithFallback } from '@/lib/collections/registry';
import moduleProps from '@/lib/sanity/module-props';
import { fetchSanityLive } from '@/sanity/lib/live';
import DocsFrontpageClient from './DocsFrontpageClient';

interface DocsFrontpageProps extends Sanity.DocsFrontpage {
  collectionSlug?: string;
  locale?: string;
}

interface DocCategory {
  _id: string;
  title: string;
  slug: { current: string };
  description?: string;
  icon?: string;
  order: number;
}

interface DocItem {
  _id: string;
  metadata: {
    title: string;
    slug: { current: string };
  };
  excerpt?: string;
  icon?: string;
  order: number;
  category?: {
    _id: string;
    title: string;
    slug: { current: string };
    icon?: string;
  };
  parent?: {
    _id: string;
  };
}

// Fetch documentation articles with category
async function fetchDocs(collectionSlug: string, locale: string) {
  return await fetchSanityLive<DocItem[]>({
    query: groq`
      *[
        _type == 'collection.documentation' &&
        collection->metadata.slug.current == $collectionSlug &&
        (language == $locale || language == null)
      ]|order(order asc){
        _id,
        metadata {
          title,
          "slug": { "current": slug.current }
        },
        excerpt,
        icon,
        order,
        category->{
          _id,
          title,
          "slug": { "current": slug.current },
          icon
        },
        parent->{
          _id
        }
      }
    `,
    params: {
      collectionSlug,
      locale,
    },
  });
}

// Fetch all documentation categories
async function fetchCategories() {
  return await fetchSanityLive<DocCategory[]>({
    query: groq`
      *[_type == 'docs.category']|order(order asc){
        _id,
        title,
        "slug": { "current": slug.current },
        description,
        icon,
        order
      }
    `,
    params: {},
  });
}

// Loading skeleton
function ListSkeleton({ layout }: { layout: string }) {
  if (layout === 'cards') {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={`skeleton-${i}`} className="animate-pulse p-6 bg-muted rounded-xl">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-muted-foreground/20 rounded" />
              <div className="flex-1 space-y-2">
                <div className="h-5 w-3/4 bg-muted-foreground/20 rounded" />
                <div className="h-4 w-full bg-muted-foreground/20 rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Category skeleton */}
      <div className="space-y-2">
        <div className="animate-pulse h-6 w-32 bg-muted-foreground/20 rounded" />
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={`skeleton-${i}`} className="animate-pulse flex items-center gap-2 py-2 ml-4">
            <div className="w-4 h-4 bg-muted-foreground/20 rounded" />
            <div className="h-4 w-48 bg-muted-foreground/20 rounded" />
          </div>
        ))}
      </div>
      <div className="space-y-2">
        <div className="animate-pulse h-6 w-40 bg-muted-foreground/20 rounded" />
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={`skeleton-2-${i}`} className="animate-pulse flex items-center gap-2 py-2 ml-4">
            <div className="w-4 h-4 bg-muted-foreground/20 rounded" />
            <div className="h-4 w-36 bg-muted-foreground/20 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

// Async content component
async function DocsContent({
  collectionSlug,
  locale,
  layout,
  sidebarStyle,
  showCategoryDescriptions,
  showCategoryIcons,
  showUncategorized,
  uncategorizedLabel,
  uncategorizedPosition,
  categoryOrder,
  intro,
  showSearch,
}: {
  collectionSlug: string;
  locale: string;
  layout: 'sidebar' | 'cards' | 'categorized';
  sidebarStyle: 'collapsible' | 'expanded' | 'flat';
  showCategoryDescriptions: boolean;
  showCategoryIcons: boolean;
  showUncategorized: boolean;
  uncategorizedLabel: string;
  uncategorizedPosition: 'start' | 'end';
  categoryOrder: string[];
  intro?: Sanity.BlockContent;
  showSearch?: boolean;
}) {
  const [docs, categories] = await Promise.all([
    fetchDocs(collectionSlug, locale),
    fetchCategories(),
  ]);

  return (
    <DocsFrontpageClient
      docs={docs}
      categories={categories}
      categoryOrder={categoryOrder}
      layout={layout}
      sidebarStyle={sidebarStyle}
      showCategoryDescriptions={showCategoryDescriptions}
      showCategoryIcons={showCategoryIcons}
      showUncategorized={showUncategorized}
      uncategorizedLabel={uncategorizedLabel}
      uncategorizedPosition={uncategorizedPosition}
      collectionSlug={collectionSlug}
      intro={intro ? <SharedPortableText value={intro} className="richtext flex-1" /> : undefined}
      showSearch={showSearch}
    />
  );
}

export default async function DocsFrontpageServer({
  intro,
  layout = 'sidebar',
  sidebarStyle = 'collapsible',
  showCategoryDescriptions = false,
  showCategoryIcons = true,
  showUncategorized = true,
  uncategorizedLabel = 'Other',
  uncategorizedPosition = 'end',
  categoryOrder,
  showSearch,
  collectionSlug: providedSlug,
  locale = 'en',
  ...props
}: DocsFrontpageProps) {
  // Self-determine collection slug from site settings if not provided
  let collectionSlug = providedSlug;

  if (!collectionSlug) {
    collectionSlug = getCollectionSlugWithFallback('collection.documentation', locale);
    if (!collectionSlug) {
      return (
        <Section className="space-y-8" {...moduleProps(props)}>
          <div className="text-center py-12 text-muted-foreground">
            <p>Documentation collection not configured for this language.</p>
            <p className="text-sm mt-2">Configure the documentation frontpage in site settings.</p>
          </div>
        </Section>
      );
    }
  }

  const cleanLayout = stegaClean(layout) as 'sidebar' | 'cards' | 'categorized';
  const cleanSidebarStyle = stegaClean(sidebarStyle) as 'collapsible' | 'expanded' | 'flat';
  const cleanUncategorizedPosition = stegaClean(uncategorizedPosition) as 'start' | 'end';

  // Extract category IDs from categoryOrder references
  const categoryIds = (categoryOrder || [])
    .map((ref: { _ref?: string }) => ref?._ref)
    .filter(Boolean) as string[];

  return (
    <Section className="space-y-8" {...moduleProps(props)}>
      <Suspense fallback={<ListSkeleton layout={cleanLayout} />}>
        <DocsContent
          collectionSlug={collectionSlug}
          locale={locale}
          layout={cleanLayout}
          sidebarStyle={cleanSidebarStyle}
          showCategoryDescriptions={showCategoryDescriptions ?? false}
          showCategoryIcons={showCategoryIcons ?? true}
          showUncategorized={showUncategorized ?? true}
          uncategorizedLabel={uncategorizedLabel || 'Other'}
          uncategorizedPosition={cleanUncategorizedPosition}
          categoryOrder={categoryIds}
          intro={intro}
          showSearch={showSearch}
        />
      </Suspense>
    </Section>
  );
}
