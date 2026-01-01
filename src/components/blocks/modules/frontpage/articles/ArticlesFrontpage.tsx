/**
 * Articles Frontpage Module Component
 * @version 3.0.0
 * @lastUpdated 2026-01-01
 * @description Displays a list of articles from a collection with hero, filters, and pagination.
 * Uses server-side pagination and filtering for optimal performance with large datasets (1000+ articles).
 */

import { groq } from 'next-sanity';
import { Suspense } from 'react';
import ArticleFilterBar from '@/components/blocks/modules/frontpage/articles/ArticleFrontpage/ArticleFilterBar';
import ArticleHeroWrapper from '@/components/blocks/modules/frontpage/articles/ArticleFrontpage/ArticleHeroWrapper';
import Paginated from '@/components/blocks/modules/frontpage/articles/ArticleFrontpage/Paginated';
import PostPreview from '@/components/blocks/modules/frontpage/articles/PostPreview';
import { routing } from '@/i18n/routing';
import moduleProps from '@/lib/sanity/module-props';
import { fetchSanityLive } from '@/sanity/lib/live';
import { AUTHOR_PREVIEW_QUERY, CATEGORY_PREVIEW_QUERY, IMAGE_QUERY } from '@/sanity/lib/queries';

interface ArticlesFrontpageProps extends Sanity.ArticlesFrontpage {
  collectionSlug?: string;
  locale?: string;
  searchParams?: {
    page?: string;
    category?: string;
    author?: string;
    search?: string;
  };
}

// Build dynamic GROQ filter based on search params
function buildArticleFilter(
  _collectionSlug: string,
  _locale: string,
  params?: ArticlesFrontpageProps['searchParams']
) {
  const filters = [
    '_type == "collection.article"',
    'collection->metadata.slug.current == $collectionSlug',
    'language == $locale',
  ];

  if (params?.category && params.category !== 'All') {
    filters.push('$category in categories[]->slug.current');
  }

  if (params?.author) {
    filters.push('$author in authors[]->slug.current');
  }

  if (params?.search) {
    filters.push('metadata.title match $search || pt::text(body) match $search');
  }

  return filters.join(' && ');
}

// Fetch paginated collection articles with filters
async function fetchCollectionPosts(
  collectionSlug: string,
  locale: string,
  page: number,
  limit: number,
  params?: ArticlesFrontpageProps['searchParams']
) {
  const offset = (page - 1) * limit;
  const filter = buildArticleFilter(collectionSlug, locale, params);

  const posts = await fetchSanityLive<Sanity.CollectionArticlePost[]>({
    query: groq`
      *[${filter}]|order(publishDate desc)[${offset}...${offset + limit}]{
        _type,
        _id,
        featured,
        publishDate,
        language,
        "readTime": math::max([1, round(length(string::split(pt::text(body), ' ')) / 200)]),
        metadata {
          title,
          description,
          "slug": { "current": slug.current },
          image { ${IMAGE_QUERY} }
        },
        seo {
          description,
          image { ${IMAGE_QUERY} }
        },
        collection->{
          metadata {
            slug { current },
            title
          }
        },
        categories[]->${CATEGORY_PREVIEW_QUERY},
        authors[]->${AUTHOR_PREVIEW_QUERY}
      }
    `,
    params: {
      collectionSlug,
      locale,
      category: params?.category || null,
      author: params?.author || null,
      search: params?.search ? `*${params.search}*` : null,
    },
  });

  return posts;
}

// Fetch total count for pagination
async function fetchTotalCount(
  collectionSlug: string,
  locale: string,
  params?: ArticlesFrontpageProps['searchParams']
) {
  const filter = buildArticleFilter(collectionSlug, locale, params);

  const result = await fetchSanityLive<number>({
    query: groq`count(*[${filter}])`,
    params: {
      collectionSlug,
      locale,
      category: params?.category || null,
      author: params?.author || null,
      search: params?.search ? `*${params.search}*` : null,
    },
  });

  return result;
}

// Fetch hero posts (unfiltered, for display above filters)
async function fetchHeroPosts(collectionSlug: string, locale: string) {
  return await fetchSanityLive<Sanity.CollectionArticlePost[]>({
    query: groq`
      *[
        _type == 'collection.article' &&
        collection->metadata.slug.current == $collectionSlug &&
        language == $locale
      ]|order(publishDate desc)[0...3]{
        _type,
        _id,
        featured,
        publishDate,
        language,
        "readTime": math::max([1, round(length(string::split(pt::text(body), ' ')) / 200)]),
        metadata {
          title,
          description,
          "slug": { "current": slug.current },
          image { ${IMAGE_QUERY} }
        },
        seo {
          description,
          image { ${IMAGE_QUERY} }
        },
        collection->{
          metadata {
            slug { current },
            title
          }
        },
        categories[]->${CATEGORY_PREVIEW_QUERY},
        authors[]->${AUTHOR_PREVIEW_QUERY}
      }
    `,
    params: {
      collectionSlug,
      locale,
    },
  });
}

export default async function ArticlesFrontpage({
  showFeaturedFirst = true,
  displayFilters = true,
  limit = 12,
  showRssLink = true,
  collectionSlug,
  locale = 'en',
  searchParams,
  ...props
}: ArticlesFrontpageProps) {
  // If no collection slug is provided, we can't fetch posts
  if (!collectionSlug) {
    return (
      <div {...moduleProps(props)}>
        <div className="text-center py-12 text-muted-foreground">
          <p>Collection not configured. Add this module to a page to create a collection.</p>
        </div>
      </div>
    );
  }

  // Parse page number from search params
  const currentPage = Math.max(1, Number.parseInt(searchParams?.page || '1', 10));

  // Fetch hero posts (unfiltered, for display above filters)
  const heroPosts = await fetchHeroPosts(collectionSlug, locale);

  // Determine Hero Post
  let heroPost: Sanity.CollectionArticlePost | undefined;
  if (showFeaturedFirst) {
    heroPost = heroPosts.find((post) => post.featured === 'featured');
  }
  if (!heroPost) {
    heroPost = heroPosts[0];
  }

  // Filter out hero post for sidebar
  const remainingPosts = heroPosts.filter((post) => post._id !== heroPost?._id);

  // Determine Sidebar Posts (Recent & Popular)
  const recentPost = remainingPosts[0];
  const popularPost =
    remainingPosts.slice(1).find((post) => post.featured === 'featured') || remainingPosts[1];

  // Fetch paginated posts with filters (server-side)
  const posts = await fetchCollectionPosts(
    collectionSlug,
    locale,
    currentPage,
    limit,
    searchParams
  );
  const totalCount = await fetchTotalCount(collectionSlug, locale, searchParams);

  const languagePrefix = locale && locale !== routing.defaultLocale ? `/${locale}` : '';
  const rssUrl = showRssLink ? `${languagePrefix}/${collectionSlug}/rss.xml` : undefined;

  return (
    <div {...moduleProps(props)}>
      <ArticleHeroWrapper heroPost={heroPost} recentPost={recentPost} popularPost={popularPost} />

      {displayFilters && (
        <ArticleFilterBar rssUrl={rssUrl} collectionSlug={collectionSlug} locale={locale} />
      )}

      <section className="min-h-screen bg-slate-50 py-8 dark:bg-[#0f172a]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Suspense
            fallback={
              <ul className="grid gap-6 sm:grid-cols-[repeat(auto-fill,minmax(300px,1fr))]">
                {Array.from({ length: limit }).map((_, i) => (
                  <li key={`skeleton-${i}`}>
                    <PostPreview skeleton />
                  </li>
                ))}
              </ul>
            }
          >
            <Paginated posts={posts} totalCount={totalCount} itemsPerPage={limit} />
          </Suspense>
        </div>
      </section>
    </div>
  );
}
