import type { Metadata } from 'next';
import { stegaClean } from 'next-sanity';
import { type Locale, routing } from '@/i18n/routing';
import { BASE_URL, dev, isPreview, isStaging, vercelPreview } from '@/lib/core/env';
import { getSiteOptional } from '@/sanity/lib/fetch';
import resolveUrl from './resolve-url-server';

/**
 * Extract site title from GROQ-resolved site settings.
 * GROQ queries resolve internationalized arrays to simple strings,
 * but TypeScript types still expect the array structure.
 * This helper safely extracts the resolved string value.
 */
function getSiteName(site: Sanity.Site | null): string | undefined {
  if (!site?.title) return undefined;
  // GROQ coalesces the i18n array to a string at query time
  // Type assertion needed because TS sees InternationalizedArrayString but runtime is string
  return site.title as unknown as string;
}

// Generate hreflang alternate URLs for all supported locales
async function generateAlternateLanguages(
  page: Sanity.PageBase,
  translations?: Array<{ slug: string; language: string; _type: string }>
): Promise<Record<string, string>> {
  const alternates: Record<string, string> = {};
  const defaultLocale = routing.defaultLocale;
  const locales = routing.locales as Locale[];

  for (const locale of locales) {
    // Check if there's a translation for this locale (filter out null items)
    const translation = translations?.filter(Boolean).find((t) => t.language === locale);

    if (translation) {
      // Use the translation's slug
      const langPrefix = locale === defaultLocale ? '' : `/${locale}`;
      const slugPath = translation.slug === 'index' ? '' : `/${translation.slug}`;
      alternates[locale] = `${BASE_URL}${langPrefix}${slugPath}`;
    } else if (locale === page.language) {
      // Current page's locale
      alternates[locale] = await resolveUrl(page, { base: true });
    }
  }

  // Add x-default pointing to the default locale version
  if (alternates[defaultLocale]) {
    alternates['x-default'] = alternates[defaultLocale];
  }

  return alternates;
}

// SEO-specific fields (subset of Metadata without slug)
interface SeoFields {
  title?: string;
  description?: string;
  ogimage?: string;
  noIndex?: boolean;
}

// Article types that should use 'article' OpenGraph type
const ARTICLE_TYPES = ['collection.article', 'collection.newsletter', 'collection.events'];

function getOpenGraphType(pageType: string): 'article' | 'website' {
  return ARTICLE_TYPES.includes(pageType) ? 'article' : 'website';
}

function getPublishedTime(
  page:
    | Sanity.CollectionArticlePost
    | Sanity.CollectionNewsletter
    | Sanity.CollectionEvents
    | unknown
): string | undefined {
  if ((page as Sanity.CollectionArticlePost).publishDate) {
    return (page as Sanity.CollectionArticlePost).publishDate;
  }
  if ((page as Sanity.CollectionEvents).startDateTime) {
    return (page as Sanity.CollectionEvents).startDateTime;
  }
  return undefined;
}

function shouldNoIndex(noIndex?: boolean): boolean | undefined {
  if (noIndex || vercelPreview || isStaging || isPreview) {
    return false;
  }
  return undefined;
}

function getEnvironmentPrefix(): string {
  if (dev) return '[DEV] ';
  if (isStaging) return '[STAGING] ';
  if (isPreview) return '[PREVIEW] ';
  return '';
}

function extractTwitterHandle(
  socialLinks?: Array<{ text: string; url: string }>
): string | undefined {
  if (!socialLinks) return undefined;

  // Find Twitter/X link by checking the URL hostname
  const twitterLink = socialLinks.find((link) => {
    try {
      const parsed = new URL(link.url, BASE_URL);
      const hostname = parsed.hostname.toLowerCase();
      return hostname === 'twitter.com' || hostname === 'www.twitter.com' || hostname === 'x.com' || hostname === 'www.x.com';
    } catch {
      return false;
    }
  });

  if (!twitterLink) return undefined;

  // Extract username from URL (e.g., https://twitter.com/username or https://x.com/username)
  const match = twitterLink.url.match(/(?:twitter\.com|x\.com)\/(@?\w+)/);
  return match ? `@${match[1].replace('@', '')}` : undefined;
}

function getOpenGraphLocale(language: string): string {
  // Map language codes to OpenGraph locale format
  const localeMap: Record<string, string> = {
    en: 'en_US',
    nb: 'nb_NO',
    ar: 'ar_SA',
  };
  return localeMap[language] || 'en_US';
}

type ProcessMetadataPage = (
  | Sanity.Page
  | Sanity.ComponentLibrary
  | Sanity.CollectionArticlePost
  | Sanity.CollectionDocumentation
  | Sanity.CollectionEvents
  | Sanity.CollectionNewsletter
) & {
  seo?: SeoFields;
  translations?: Array<{ slug: string; language: string; _type: string }>;
};

function getMetadataBase(): URL {
  try {
    return new URL(BASE_URL);
  } catch (_error) {
    // Fallback to localhost if BASE_URL is invalid during build
    return new URL('http://localhost:3000');
  }
}

function getOgImage(page: ProcessMetadataPage, cleanTitle: string): string {
  const uploadedOg = page.seo?.ogimage || page.metadata?.ogimage;
  if (uploadedOg) return uploadedOg;

  const isArticleType = ARTICLE_TYPES.includes(page._type);
  const isArticlesFrontpage =
    page._type === 'page' &&
    'collectionType' in page &&
    (page as { collectionType?: string }).collectionType === 'articles-frontpage';
  const useArticleFallback = isArticleType || isArticlesFrontpage;

  return useArticleFallback
    ? `${BASE_URL}/api/og/article-fallback?title=${encodeURIComponent(cleanTitle)}&locale=${page.language || 'en'}`
    : `${BASE_URL}/api/og?title=${encodeURIComponent(cleanTitle)}`;
}

export default async function processMetadata(
  page: ProcessMetadataPage,
  searchParams?: Record<string, string | string[] | undefined>,
  options?: {
    rssUrl?: string;
  }
): Promise<Metadata> {
  // Require either seo or metadata to be present
  if (!page.seo && !page.metadata) {
    throw new Error('Page SEO metadata is required');
  }

  // Fetch site settings for enhanced metadata
  const site = await getSiteOptional();

  const url = await resolveUrl(page as Sanity.PageBase, {
    params: searchParams,
    allowList: ['page', 'category'],
  });

  // Prefer 'seo' field (new schema) over legacy 'metadata'
  const title = page.seo?.title || page.metadata?.title;
  const description = page.seo?.description || page.metadata?.description;
  const noIndex = page.seo?.noIndex ?? page.metadata?.noIndex;

  // Clean metadata values for SEO and browser display
  const envPrefix = getEnvironmentPrefix();
  const cleanTitle = `${envPrefix}${stegaClean(title ?? '')}`;
  const cleanDescription = stegaClean(description ?? '');

  const ogImage = getOgImage(page, cleanTitle);
  const metadataBase = getMetadataBase();

  const publishedTime = getPublishedTime(page);
  const twitterSite = extractTwitterHandle(site?.socialLinks);
  const ogLocale = getOpenGraphLocale(page.language || 'en');

  return {
    metadataBase,
    title: cleanTitle,
    description: cleanDescription,
    openGraph: {
      type: getOpenGraphType(page._type),
      url,
      title: cleanTitle,
      description: cleanDescription,
      images: ogImage,
      siteName: getSiteName(site),
      locale: ogLocale,
      ...(publishedTime && { publishedTime }),
    },
    robots: {
      index: shouldNoIndex(noIndex),
    },
    alternates: {
      canonical: url,
      languages: await generateAlternateLanguages(page as Sanity.PageBase, page.translations),
      ...(options?.rssUrl && {
        types: {
          'application/rss+xml': options.rssUrl,
        },
      }),
    },
    twitter: {
      card: 'summary_large_image',
      ...(twitterSite && { site: twitterSite }),
    },
  };
}
