import { notFound } from 'next/navigation';
import { groq } from 'next-sanity';
import { Modules } from '@/components/blocks/modules';
import {
  ArticleDetail,
  DocDetail,
  EventDetail,
  NewsletterDetail,
} from '@/components/blocks/modules/frontpage';
import { BreadcrumbJsonLd, JsonLd } from '@/components/blocks/seo';
import { PageProvider } from '@/contexts';
import { routing } from '@/i18n/routing';
import { getAllCollections, getCollectionSlugWithFallback } from '@/lib/collections/registry';
import type { CollectionType } from '@/lib/collections/types';
import { BASE_URL } from '@/lib/core/env';
import { logger } from '@/lib/core/logger';
import { groupPlacements, type Placement } from '@/lib/sanity/placement';
import processMetadata from '@/lib/sanity/process-metadata';
import resolveUrl from '@/lib/sanity/resolve-url-server';
import { parseFilterParams } from '@/lib/utils/url';
import { client } from '@/sanity/lib/client';
import { getSiteOptional } from '@/sanity/lib/fetch';
import { fetchSanityLive } from '@/sanity/lib/live';
import {
  COLLECTION_ARTICLE_POST_QUERY,
  COLLECTION_ARTICLE_SLUGS_QUERY,
  COLLECTION_DOCUMENTATION_QUERY,
  COLLECTION_DOCUMENTATION_SLUGS_QUERY,
  COLLECTION_EVENTS_QUERY,
  COLLECTION_EVENTS_SLUGS_QUERY,
  COLLECTION_NEWSLETTER_QUERY,
  COLLECTION_NEWSLETTER_SLUGS_QUERY,
  IS_COLLECTION_PAGE_QUERY,
  MODULES_QUERY,
  placementQuery,
  SLUG_QUERY,
  TRANSLATIONS_QUERY,
} from '@/sanity/lib/queries';

// ============================================================================
// Types
// ============================================================================

type Props = {
  params: Promise<{ slug?: string[]; locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

type BreadcrumbItem = { name: string; path: string };

// ============================================================================
// Breadcrumb Builders
// ============================================================================

function buildBaseBreadcrumbs(
  locale: string,
  collectionSlug: string,
  collectionTitle: string | undefined
): BreadcrumbItem[] {
  const localePath = locale !== 'en' ? `/${locale}` : '';
  return [
    { name: 'Home', path: `${localePath}/` },
    {
      name: collectionTitle || collectionSlug,
      path: `${localePath}/${collectionSlug}`,
    },
  ];
}

function buildNewsletterBreadcrumbs(
  locale: string,
  collectionSlug: string,
  issue: Sanity.CollectionNewsletter
): BreadcrumbItem[] {
  const localePath = locale !== 'en' ? `/${locale}` : '';
  return [
    ...buildBaseBreadcrumbs(locale, collectionSlug, undefined),
    {
      name: issue.metadata?.title || 'Issue',
      path: `${localePath}/${collectionSlug}/${issue.metadata?.slug?.current}`,
    },
  ];
}

function buildDocsBreadcrumbs(
  locale: string,
  collectionSlug: string,
  doc: Sanity.CollectionDocumentation
): BreadcrumbItem[] {
  const localePath = locale !== 'en' ? `/${locale}` : '';
  const base = buildBaseBreadcrumbs(locale, collectionSlug, undefined);

  if (doc.parent?.metadata?.title) {
    base.push({
      name: doc.parent.metadata.title,
      path: `${localePath}/${collectionSlug}/${doc.parent.metadata?.slug?.current}`,
    });
  }

  base.push({
    name: doc.metadata?.title || 'Article',
    path: `${localePath}/${collectionSlug}/${doc.metadata?.slug?.current}`,
  });

  return base;
}

function buildEventsBreadcrumbs(
  locale: string,
  collectionSlug: string,
  event: Sanity.CollectionEvents
): BreadcrumbItem[] {
  const localePath = locale !== 'en' ? `/${locale}` : '';
  return [
    ...buildBaseBreadcrumbs(locale, collectionSlug, undefined),
    {
      name: event.metadata?.title || 'Event',
      path: `${localePath}/${collectionSlug}/${event.metadata?.slug?.current}`,
    },
  ];
}

function buildArticleBreadcrumbs(
  locale: string,
  collectionSlug: string,
  post: Sanity.CollectionArticlePost
): BreadcrumbItem[] {
  const localePath = locale !== 'en' ? `/${locale}` : '';
  const base = buildBaseBreadcrumbs(locale, collectionSlug, undefined);

  if (post.categories?.[0]) {
    base.push({
      name: post.categories[0].title || 'Category',
      path: `${localePath}/${collectionSlug}?category=${post.categories[0].slug?.current}`,
    });
  }

  base.push({
    name: post.metadata?.title || 'Post',
    path: `${localePath}/${collectionSlug}/${post.metadata?.slug?.current}`,
  });

  return base;
}

// ============================================================================
// JSON-LD Builders
// ============================================================================

async function buildNewsletterJsonLd(issue: Sanity.CollectionNewsletter) {
  const site = await getSiteOptional();

  return {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: issue.metadata?.title,
    description: issue.seo?.description,
    image: issue.seo?.ogimage,
    datePublished: issue.publishDate,
    dateModified: issue._updatedAt,
    publisher: {
      '@type': 'Organization',
      name: site?.title || 'NextMedal',
      url: BASE_URL,
      logo: {
        '@type': 'ImageObject',
        url: site?.logo?.asset?.url || `${BASE_URL}/logo.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': resolveUrl(
        { ...issue, _type: 'collection.newsletter' } as unknown as Sanity.PageBase,
        { base: true }
      ),
    },
  };
}

async function buildDocsJsonLd(doc: Sanity.CollectionDocumentation) {
  const site = await getSiteOptional();

  return {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: doc.metadata?.title,
    description: doc.seo?.description || doc.excerpt,
    image: doc.seo?.ogimage,
    dateModified: doc._updatedAt,
    publisher: {
      '@type': 'Organization',
      name: site?.title || 'NextMedal',
      url: BASE_URL,
      logo: {
        '@type': 'ImageObject',
        url: site?.logo?.asset?.url || `${BASE_URL}/logo.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': resolveUrl(
        { ...doc, _type: 'collection.documentation' } as unknown as Sanity.PageBase,
        { base: true }
      ),
    },
  };
}

function buildEventLocation(event: Sanity.CollectionEvents) {
  if (event.location?.venue) {
    return {
      '@type': 'Place',
      name: event.location.venue,
      address: {
        '@type': 'PostalAddress',
        streetAddress: event.location.address,
        addressLocality: event.location.city,
        addressCountry: event.location.country,
      },
    };
  }
  if (event.onlineLinks?.liveUrl) {
    return {
      '@type': 'VirtualLocation',
      url: event.onlineLinks.liveUrl,
    };
  }
  return undefined;
}

function getEventStatus(status: string | undefined) {
  return status === 'cancelled'
    ? 'https://schema.org/EventCancelled'
    : 'https://schema.org/EventScheduled';
}

function getEventAttendanceMode(eventType: string | undefined) {
  if (eventType === 'physical') return 'https://schema.org/OfflineEventAttendanceMode';
  if (eventType === 'hybrid') return 'https://schema.org/MixedEventAttendanceMode';
  return 'https://schema.org/OnlineEventAttendanceMode';
}

function buildEventsJsonLd(event: Sanity.CollectionEvents) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: event.metadata?.title,
    description: event.seo?.description,
    image: event.seo?.ogimage,
    startDate: event.startDateTime,
    endDate: event.endDateTime,
    eventStatus: getEventStatus(event.status),
    eventAttendanceMode: getEventAttendanceMode(event.eventType),
    location: buildEventLocation(event),
    performer: event.speakers?.map((speaker: { name: string }) => ({
      '@type': 'Person',
      name: speaker.name,
    })),
    url: resolveUrl({ ...event, _type: 'collection.events' } as unknown as Sanity.PageBase, {
      base: true,
    }),
  };
}

async function buildArticleJsonLd(post: Sanity.CollectionArticlePost) {
  const site = await getSiteOptional();

  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.metadata?.title,
    description: post.seo?.description,
    image: post.seo?.ogimage,
    datePublished: post.publishDate,
    dateModified: post._updatedAt,
    author: post.authors?.map((author: { name: string }) => ({
      '@type': 'Person',
      name: author.name,
    })),
    publisher: {
      '@type': 'Organization',
      name: site?.title || 'NextMedal',
      url: BASE_URL,
      logo: {
        '@type': 'ImageObject',
        url: site?.logo?.asset?.url || `${BASE_URL}/logo.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': resolveUrl({ ...post, _type: 'collection.article' } as unknown as Sanity.PageBase, {
        base: true,
      }),
    },
  };
}

// ============================================================================
// Collection Item Renderers
// ============================================================================

async function renderNewsletterItem(
  issue: Sanity.CollectionNewsletter,
  collectionSlug: string,
  locale: string
) {
  const breadcrumbs = buildNewsletterBreadcrumbs(locale, collectionSlug, issue);
  const newsletterJsonLd = await buildNewsletterJsonLd(issue);
  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbs} />
      <JsonLd data={newsletterJsonLd} />
      <NewsletterDetail issue={issue} collectionSlug={collectionSlug} locale={locale} />
    </>
  );
}

async function renderDocsItem(
  doc: Sanity.CollectionDocumentation,
  collectionSlug: string,
  locale: string
) {
  const breadcrumbs = buildDocsBreadcrumbs(locale, collectionSlug, doc);
  const docsJsonLd = await buildDocsJsonLd(doc);
  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbs} />
      <JsonLd data={docsJsonLd} />
      <DocDetail doc={doc} />
    </>
  );
}

function renderEventsItem(event: Sanity.CollectionEvents, collectionSlug: string, locale: string) {
  const breadcrumbs = buildEventsBreadcrumbs(locale, collectionSlug, event);
  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbs} />
      <JsonLd data={buildEventsJsonLd(event)} />
      <EventDetail event={event} collectionSlug={collectionSlug} locale={locale} />
    </>
  );
}

async function renderArticleItem(
  post: Sanity.CollectionArticlePost,
  collectionSlug: string,
  locale: string
) {
  const breadcrumbs = buildArticleBreadcrumbs(locale, collectionSlug, post);
  const articleJsonLd = await buildArticleJsonLd(post);
  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbs} />
      <JsonLd data={articleJsonLd} />
      <ArticleDetail post={post} collectionSlug={collectionSlug} />
    </>
  );
}

// ============================================================================
// Collection Item Handler
// ============================================================================

async function handleCollectionItem(
  requestedSlug: string,
  itemSlug: string,
  locale: string,
  collectionType: string | null
) {
  if (collectionType === 'newsletter-frontpage') {
    const issue = await getCollectionNewsletterIssue(itemSlug, locale);
    if (!issue) return null;
    return renderNewsletterItem(issue, requestedSlug, locale);
  }

  if (collectionType === 'docs-frontpage') {
    const doc = await getCollectionDocumentationArticle(itemSlug, locale);
    if (!doc) return null;
    return renderDocsItem(doc, requestedSlug, locale);
  }

  if (collectionType === 'events-frontpage') {
    const event = await getCollectionEvent(itemSlug, locale);
    if (!event) return null;
    return renderEventsItem(event, requestedSlug, locale);
  }

  // Default: article collection
  const post = await getCollectionArticlePost(itemSlug, locale);
  if (!post) return null;
  return renderArticleItem(post, requestedSlug, locale);
}

// ============================================================================
// Page Component
// ============================================================================

export default async function Page({ params, searchParams }: Props) {
  const { slug, locale } = await params;
  const resolvedSearchParams = await searchParams;

  // Parse and normalize searchParams at page level
  const filterParams = parseFilterParams(resolvedSearchParams);

  // Handle collection items (multi-segment slug like /news/my-article)
  if (slug?.length === 2) {
    const [collectionSlug, itemSlug] = slug;
    const collectionCheck = await checkCollectionPage(collectionSlug, locale);

    if (collectionCheck?.isCollection) {
      const content = await handleCollectionItem(
        collectionSlug,
        itemSlug,
        locale,
        collectionCheck.collectionType
      );
      if (!content) notFound();
      return content;
    }
  }

  // Regular page handling
  const page = await getPage(slug, locale);
  if (!page) notFound();

  const placements = groupPlacements(page.placements);

  return (
    <PageProvider page={page}>
      {placements.top && <Modules modules={placements.top} searchParams={filterParams} />}
      {page.modules && page.modules.length > 0 && (
        <Modules modules={page.modules} page={page} searchParams={filterParams} />
      )}
      {placements.bottom && <Modules modules={placements.bottom} searchParams={filterParams} />}
    </PageProvider>
  );
}

// ============================================================================
// Metadata Generation
// ============================================================================

async function fetchAndValidateCollectionItem<T>(
  fetcher: (slug: string, locale: string, stega?: boolean) => Promise<T | null>,
  collectionType: CollectionType,
  itemSlug: string,
  requestedSlug: string,
  locale: string
): Promise<T | null> {
  const item = await fetcher(itemSlug, locale, false);
  if (!item) return null;

  // Validate collection slug matches site settings
  const collectionSlug = getCollectionSlugWithFallback(collectionType, locale);
  if (requestedSlug !== collectionSlug) return null;

  return item;
}

async function getCollectionItemMetadata(
  requestedSlug: string,
  itemSlug: string,
  locale: string,
  collectionType: string | null,
  searchParams: Record<string, string | string[] | undefined>
) {
  const handlers = {
    'newsletter-frontpage': {
      type: 'collection.newsletter' as CollectionType,
      fetcher: getCollectionNewsletterIssue,
    },
    'docs-frontpage': {
      type: 'collection.documentation' as CollectionType,
      fetcher: getCollectionDocumentationArticle,
    },
    'events-frontpage': {
      type: 'collection.events' as CollectionType,
      fetcher: getCollectionEvent,
    },
  };

  const handler = collectionType ? handlers[collectionType as keyof typeof handlers] : null;

  if (handler) {
    const item = await fetchAndValidateCollectionItem(
      // @ts-expect-error - handler.fetcher is a union type of different collection fetchers
      handler.fetcher,
      handler.type,
      itemSlug,
      requestedSlug,
      locale
    );
    return item ? processMetadata(item, searchParams) : null;
  }

  const post = await fetchAndValidateCollectionItem(
    getCollectionArticlePost,
    'collection.article',
    itemSlug,
    requestedSlug,
    locale
  );

  if (!post) return null;

  // Build RSS feed URL using the dynamic collection slug
  const languagePrefix = locale !== 'en' ? `/${locale}` : '';
  const rssUrl = `${languagePrefix}/${requestedSlug}/rss.xml`;

  return processMetadata(post, searchParams, { rssUrl });
}

export async function generateMetadata({ params, searchParams }: Props) {
  const { slug, locale } = await params;
  const resolvedSearchParams = await searchParams;

  // Handle collection items
  if (slug?.length === 2) {
    const [collectionSlug, itemSlug] = slug;
    const collectionCheck = await checkCollectionPage(collectionSlug, locale);

    if (collectionCheck?.isCollection) {
      const metadata = await getCollectionItemMetadata(
        collectionSlug,
        itemSlug,
        locale,
        collectionCheck.collectionType,
        resolvedSearchParams
      );
      if (!metadata) notFound();
      return metadata;
    }
  }

  const page = await getPage(slug, locale, false);
  if (!page) notFound();
  return processMetadata(page, resolvedSearchParams);
}

// ============================================================================
// Static Params Generation
// ============================================================================

export async function generateStaticParams() {
  const clientWithoutStega = client.withConfig({ stega: false });
  const fetchOptions = { perspective: 'published' as const };

  // Fetch all content types in parallel
  const [pages, collectionPosts, collectionNewsletters, collectionDocs, collectionEvents] =
    await Promise.all([
      clientWithoutStega.fetch<{ slug: string }[]>(
        groq`*[
          _type in ['page', 'component.library'] &&
          defined(metadata.slug.current) &&
          !(metadata.slug.current in ['index'])
        ]{ 'slug': metadata.slug.current }`,
        {},
        fetchOptions
      ),
      clientWithoutStega.fetch<{ slug: string; _type: string; language: string }[]>(
        COLLECTION_ARTICLE_SLUGS_QUERY,
        {},
        fetchOptions
      ),
      clientWithoutStega.fetch<{ slug: string; _type: string; language: string }[]>(
        COLLECTION_NEWSLETTER_SLUGS_QUERY,
        {},
        fetchOptions
      ),
      clientWithoutStega.fetch<{ slug: string; _type: string; language: string }[]>(
        COLLECTION_DOCUMENTATION_SLUGS_QUERY,
        {},
        fetchOptions
      ),
      clientWithoutStega.fetch<{ slug: string; _type: string; language: string }[]>(
        COLLECTION_EVENTS_SLUGS_QUERY,
        {},
        fetchOptions
      ),
    ]);

  // Transform to params format
  const pageParams = pages.map(({ slug }) => ({ slug: slug.split('/') }));

  // Get collection slugs for all languages
  const collectionSlugsMap = await Promise.all(
    routing.locales.map(async (locale) => {
      const collections = getAllCollections(locale);
      const slugs: Record<string, string> = {};
      if (collections) {
        for (const [type, metadata] of Object.entries(collections)) {
          slugs[type] = metadata.slug;
        }
      }

      // Log warning if collection config is incomplete (helps with debugging during build)
      const missingCollections = [
        !slugs['collection.article'] && 'articles',
        !slugs['collection.documentation'] && 'documentation',
        !slugs['collection.changelog'] && 'changelog',
        !slugs['collection.newsletter'] && 'newsletter',
        !slugs['collection.events'] && 'events',
      ].filter(Boolean);

      if (missingCollections.length > 0) {
        logger.warn(
          { locale, missing: missingCollections },
          `[generateStaticParams] Missing collection config`
        );
      }

      return { locale, slugs };
    })
  );

  // Helper to transform collection items to params using site settings
  const toCollectionParams = async (items: { slug: string; _type: string; language: string }[]) => {
    const params: { slug: string[] }[] = [];

    for (const item of items) {
      if (!item.slug) continue;

      // Find the collection slugs for this document's language
      const languageSlugs = collectionSlugsMap.find((m) => m.locale === item.language);
      if (!languageSlugs) continue;

      // Get the collection slug for this document type
      const collectionSlug = languageSlugs.slugs[item._type as CollectionType];
      if (!collectionSlug) continue;

      params.push({ slug: [collectionSlug, item.slug] });
    }

    return params;
  };

  const [postsParams, newslettersParams, docsParams, eventsParams] = await Promise.all([
    toCollectionParams(collectionPosts),
    toCollectionParams(collectionNewsletters),
    toCollectionParams(collectionDocs),
    toCollectionParams(collectionEvents),
  ]);

  return [...pageParams, ...postsParams, ...newslettersParams, ...docsParams, ...eventsParams];
}

// ============================================================================
// Data Fetching Helpers
// ============================================================================

async function checkCollectionPage(
  slug: string,
  locale: string
): Promise<{ isCollection: boolean; collectionType: string | null } | null> {
  return await fetchSanityLive<{ isCollection: boolean; collectionType: string | null }>({
    query: IS_COLLECTION_PAGE_QUERY,
    params: { slug, locale },
    stega: false,
  });
}

async function getCollectionArticlePost(itemSlug: string, locale: string, stega?: boolean) {
  return await fetchSanityLive<Sanity.CollectionArticlePost>({
    query: COLLECTION_ARTICLE_POST_QUERY,
    params: { itemSlug, locale },
    stega,
  });
}

async function getCollectionNewsletterIssue(itemSlug: string, locale: string, stega?: boolean) {
  return await fetchSanityLive<Sanity.CollectionNewsletter>({
    query: COLLECTION_NEWSLETTER_QUERY,
    params: { itemSlug, locale },
    stega,
  });
}

async function getCollectionDocumentationArticle(
  itemSlug: string,
  locale: string,
  stega?: boolean
) {
  return await fetchSanityLive<Sanity.CollectionDocumentation>({
    query: COLLECTION_DOCUMENTATION_QUERY,
    params: { itemSlug, locale },
    stega,
  });
}

async function getCollectionEvent(itemSlug: string, locale: string, stega?: boolean) {
  return await fetchSanityLive<Sanity.CollectionEvents>({
    query: COLLECTION_EVENTS_QUERY,
    params: { itemSlug, locale },
    stega,
  });
}

async function getPage(slugParts: string[] | undefined, locale: string, stega?: boolean) {
  const slug = slugParts?.join('/');

  return await fetchSanityLive<
    Sanity.Page | (Sanity.ComponentLibrary & { placements?: Placement[] })
  >({
    query: groq`*[
      _type in ['page', 'component.library'] &&
      ${SLUG_QUERY} == $slug &&
      language == $locale &&
      !(metadata.slug.current in ['index'])
    ][0]{
      ...,
      'modules': modules[]{ ${MODULES_QUERY} },
      'placements': ${placementQuery("scope == 'page'")},
      parent[]->{ metadata { slug } },
      metadata {
        ...,
        'ogimage': image.asset->url + '?w=1200'
      },
      seo {
        title,
        description,
        ogimage,
        noIndex
      },
      ${TRANSLATIONS_QUERY}
    }`,
    params: { slug, locale },
    stega,
  });
}
