/**
 * Articles Frontpage Module Component
 * @version 2.1.0
 * @lastUpdated 2025-12-30
 * @description Displays a list of articles from a collection with hero, filters, and pagination.
 * Uses the same layout as the original BlogFrontpage with addition of RSS feed link.
 */

import { groq } from 'next-sanity';
import { Suspense } from 'react';
import moduleProps from '@/lib/sanity/module-props';
import { fetchSanityLive } from '@/sanity/lib/live';
import { AUTHOR_PREVIEW_QUERY, CATEGORY_PREVIEW_QUERY, IMAGE_QUERY } from '@/sanity/lib/queries';
import BlogFilterBar from '@/ui/modules/blog/BlogFrontpage/BlogFilterBar';
import BlogHeroWrapper from '@/ui/modules/blog/BlogFrontpage/BlogHeroWrapper';
import Paginated from '@/ui/modules/blog/BlogFrontpage/Paginated';
import PostPreview from '@/ui/modules/blog/PostPreview';

interface ArticlesFrontpageProps extends Sanity.ArticlesFrontpage {
  collectionSlug?: string;
  locale?: string;
}

// Fetch collection blog posts based on collection slug
async function fetchCollectionPosts(collectionSlug: string, locale: string) {
  return await fetchSanityLive<Sanity.CollectionBlogPost[]>({
    query: groq`
      *[
        _type == 'collection.blog' &&
        collection->metadata.slug.current == $collectionSlug &&
        language == $locale
      ]|order(publishDate desc)[0...50]{
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
        collection->{ metadata { slug } },
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

  const posts = await fetchCollectionPosts(collectionSlug, locale);

  // Determine Hero Post (for unfiltered view)
  let heroPost: Sanity.CollectionBlogPost | undefined;
  if (showFeaturedFirst) {
    heroPost = posts.find((post) => post.featured === 'featured');
  }
  if (!heroPost) {
    heroPost = posts[0];
  }

  // Filter out hero post for sidebar
  const remainingPosts = posts.filter((post) => post._id !== heroPost?._id);

  // Determine Sidebar Posts (Recent & Popular)
  const recentPost = remainingPosts[0];
  const popularPost =
    remainingPosts.slice(1).find((post) => post.featured === 'featured') || remainingPosts[1];

  const rssUrl = showRssLink ? `/${collectionSlug}/rss.xml` : undefined;

  return (
    <div {...moduleProps(props)}>
      <BlogHeroWrapper heroPost={heroPost} recentPost={recentPost} popularPost={popularPost} />

      {displayFilters && (
        <BlogFilterBar rssUrl={rssUrl} collectionSlug={collectionSlug} locale={locale} />
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
            <Paginated posts={posts} itemsPerPage={limit} />
          </Suspense>
        </div>
      </section>
    </div>
  );
}
