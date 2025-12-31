import { notFound } from 'next/navigation';
import { groq } from 'next-sanity';
import { PageProvider } from '@/contexts';
import { groupPlacements, type Placement } from '@/lib/sanity/placement';
import processMetadata from '@/lib/sanity/process-metadata';
import resolveUrl from '@/lib/sanity/resolve-url';
import { client } from '@/sanity/lib/client';
import { fetchSanityLive } from '@/sanity/lib/live';
import {
  COLLECTION_BLOG_POST_QUERY,
  COLLECTION_BLOG_SLUGS_QUERY,
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
import { Modules } from '@/ui/modules';
import { ArticleDetail, DocDetail, EventDetail, NewsletterDetail } from '@/ui/modules/collections';
import { BreadcrumbJsonLd, JsonLd } from '@/ui/seo';

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
    ...buildBaseBreadcrumbs(locale, collectionSlug, issue.collection?.metadata?.title),
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
  const base = buildBaseBreadcrumbs(locale, collectionSlug, doc.collection?.metadata?.title);

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
    ...buildBaseBreadcrumbs(locale, collectionSlug, event.collection?.metadata?.title),
    {
      name: event.metadata?.title || 'Event',
      path: `${localePath}/${collectionSlug}/${event.metadata?.slug?.current}`,
    },
  ];
}

function buildBlogBreadcrumbs(
  locale: string,
  collectionSlug: string,
  post: Sanity.CollectionBlogPost
): BreadcrumbItem[] {
  const localePath = locale !== 'en' ? `/${locale}` : '';
  const base = buildBaseBreadcrumbs(locale, collectionSlug, post.collection?.metadata?.title);

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

function buildNewsletterJsonLd(issue: Sanity.CollectionNewsletter) {
  return {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: issue.metadata?.title,
    description: issue.seo?.description,
    image: issue.seo?.ogimage,
    datePublished: issue.publishDate,
    dateModified: issue._updatedAt,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': resolveUrl(
        { ...issue, _type: 'collection.newsletter' } as unknown as Sanity.PageBase,
        { base: true }
      ),
    },
  };
}

function buildDocsJsonLd(doc: Sanity.CollectionDocumentation) {
  return {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: doc.metadata?.title,
    description: doc.seo?.description || doc.excerpt,
    image: doc.seo?.ogimage,
    dateModified: doc._updatedAt,
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

function buildBlogJsonLd(post: Sanity.CollectionBlogPost) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.metadata?.title,
    description: post.seo?.description,
    image: post.seo?.ogimage,
    datePublished: post.publishDate,
    dateModified: post._updatedAt,
    author: post.authors?.map((author: { name: string }) => ({
      '@type': 'Person',
      name: author.name,
    })),
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': resolveUrl({ ...post, _type: 'collection.blog' } as unknown as Sanity.PageBase, {
        base: true,
      }),
    },
  };
}

// ============================================================================
// Collection Item Renderers
// ============================================================================

function renderNewsletterItem(
  issue: Sanity.CollectionNewsletter,
  collectionSlug: string,
  locale: string
) {
  const breadcrumbs = buildNewsletterBreadcrumbs(locale, collectionSlug, issue);
  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbs} />
      <JsonLd data={buildNewsletterJsonLd(issue)} />
      <NewsletterDetail issue={issue} collectionSlug={collectionSlug} locale={locale} />
    </>
  );
}

function renderDocsItem(
  doc: Sanity.CollectionDocumentation,
  collectionSlug: string,
  locale: string
) {
  const breadcrumbs = buildDocsBreadcrumbs(locale, collectionSlug, doc);
  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbs} />
      <JsonLd data={buildDocsJsonLd(doc)} />
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

function renderBlogItem(post: Sanity.CollectionBlogPost, collectionSlug: string, locale: string) {
  const breadcrumbs = buildBlogBreadcrumbs(locale, collectionSlug, post);
  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbs} />
      <JsonLd data={buildBlogJsonLd(post)} />
      <ArticleDetail post={post} collectionSlug={collectionSlug} locale={locale} />
    </>
  );
}

// ============================================================================
// Collection Item Handler
// ============================================================================

async function handleCollectionItem(
  collectionSlug: string,
  itemSlug: string,
  locale: string,
  collectionType: string | null
) {
  if (collectionType === 'newsletter-frontpage') {
    const issue = await getCollectionNewsletterIssue(collectionSlug, itemSlug, locale);
    if (!issue) return null;
    return renderNewsletterItem(issue, collectionSlug, locale);
  }

  if (collectionType === 'docs-frontpage') {
    const doc = await getCollectionDocumentationArticle(collectionSlug, itemSlug, locale);
    if (!doc) return null;
    return renderDocsItem(doc, collectionSlug, locale);
  }

  if (collectionType === 'events-frontpage') {
    const event = await getCollectionEvent(collectionSlug, itemSlug, locale);
    if (!event) return null;
    return renderEventsItem(event, collectionSlug, locale);
  }

  // Default: blog collection
  const post = await getCollectionBlogPost(collectionSlug, itemSlug, locale);
  if (!post) return null;
  return renderBlogItem(post, collectionSlug, locale);
}

// ============================================================================
// Page Component
// ============================================================================

export default async function Page({ params }: Props) {
  const { slug, locale } = await params;

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
      {placements.top && <Modules modules={placements.top} />}
      {page.modules && page.modules.length > 0 && <Modules modules={page.modules} page={page} />}
      {placements.bottom && <Modules modules={placements.bottom} />}
    </PageProvider>
  );
}

// ============================================================================
// Metadata Generation
// ============================================================================

async function getCollectionItemMetadata(
  collectionSlug: string,
  itemSlug: string,
  locale: string,
  collectionType: string | null,
  searchParams: Record<string, string | string[] | undefined>
) {
  if (collectionType === 'newsletter-frontpage') {
    const issue = await getCollectionNewsletterIssue(collectionSlug, itemSlug, locale, false);
    if (!issue) return null;
    return processMetadata(issue, searchParams);
  }

  if (collectionType === 'docs-frontpage') {
    const doc = await getCollectionDocumentationArticle(collectionSlug, itemSlug, locale, false);
    if (!doc) return null;
    return processMetadata(doc, searchParams);
  }

  if (collectionType === 'events-frontpage') {
    const event = await getCollectionEvent(collectionSlug, itemSlug, locale, false);
    if (!event) return null;
    return processMetadata(event, searchParams);
  }

  const post = await getCollectionBlogPost(collectionSlug, itemSlug, locale, false);
  if (!post) return null;
  return processMetadata(post, searchParams);
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
      clientWithoutStega.fetch<{ slug: string; collectionSlug: string }[]>(
        COLLECTION_BLOG_SLUGS_QUERY,
        {},
        fetchOptions
      ),
      clientWithoutStega.fetch<{ slug: string; collectionSlug: string }[]>(
        COLLECTION_NEWSLETTER_SLUGS_QUERY,
        {},
        fetchOptions
      ),
      clientWithoutStega.fetch<{ slug: string; collectionSlug: string }[]>(
        COLLECTION_DOCUMENTATION_SLUGS_QUERY,
        {},
        fetchOptions
      ),
      clientWithoutStega.fetch<{ slug: string; collectionSlug: string }[]>(
        COLLECTION_EVENTS_SLUGS_QUERY,
        {},
        fetchOptions
      ),
    ]);

  // Transform to params format
  const pageParams = pages.map(({ slug }) => ({ slug: slug.split('/') }));

  const toCollectionParams = (items: { slug: string; collectionSlug: string }[]) =>
    items
      .filter((item) => item.slug && item.collectionSlug)
      .map((item) => ({ slug: [item.collectionSlug, item.slug] }));

  return [
    ...pageParams,
    ...toCollectionParams(collectionPosts),
    ...toCollectionParams(collectionNewsletters),
    ...toCollectionParams(collectionDocs),
    ...toCollectionParams(collectionEvents),
  ];
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

async function getCollectionBlogPost(
  collectionSlug: string,
  itemSlug: string,
  locale: string,
  stega?: boolean
) {
  return await fetchSanityLive<Sanity.CollectionBlogPost>({
    query: COLLECTION_BLOG_POST_QUERY,
    params: { collectionSlug, itemSlug, locale },
    stega,
  });
}

async function getCollectionNewsletterIssue(
  collectionSlug: string,
  itemSlug: string,
  locale: string,
  stega?: boolean
) {
  return await fetchSanityLive<Sanity.CollectionNewsletter>({
    query: COLLECTION_NEWSLETTER_QUERY,
    params: { collectionSlug, itemSlug, locale },
    stega,
  });
}

async function getCollectionDocumentationArticle(
  collectionSlug: string,
  itemSlug: string,
  locale: string,
  stega?: boolean
) {
  return await fetchSanityLive<Sanity.CollectionDocumentation>({
    query: COLLECTION_DOCUMENTATION_QUERY,
    params: { collectionSlug, itemSlug, locale },
    stega,
  });
}

async function getCollectionEvent(
  collectionSlug: string,
  itemSlug: string,
  locale: string,
  stega?: boolean
) {
  return await fetchSanityLive<Sanity.CollectionEvents>({
    query: COLLECTION_EVENTS_QUERY,
    params: { collectionSlug, itemSlug, locale },
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
      ${TRANSLATIONS_QUERY}
    }`,
    params: { slug, locale },
    stega,
  });
}
