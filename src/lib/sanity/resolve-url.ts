import { stegaClean } from 'next-sanity';
import { BASE_URL } from '@/lib/core/env';

// Helper function to detect if a URL is relative (starts with / or doesn't have a protocol)
export function isRelativeUrl(url: string): boolean {
  if (!url) return false;
  const cleanUrl = url.trim();
  return (
    cleanUrl.startsWith('/') ||
    (!cleanUrl.includes('://') && !cleanUrl.startsWith('mailto:') && !cleanUrl.startsWith('tel:'))
  );
}

// Helper function to resolve any URL (relative or external)
export function resolveAnyUrl(url: string, base = false): string {
  if (!url) return '/';

  const cleanUrl = stegaClean(url);

  // If it's a relative URL, return it as-is (or with base URL if requested)
  if (isRelativeUrl(cleanUrl)) {
    return base ? `${BASE_URL}${cleanUrl}` : cleanUrl;
  }

  // If it's an external URL, return it as-is
  return cleanUrl;
}

// Build query string from params object
function buildQueryString(
  params: Record<string, string | string[] | undefined>,
  allowList?: string[]
): string | undefined {
  const usp = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (allowList && !allowList.includes(key)) continue;
    if (value === undefined || value === null) continue;

    if (Array.isArray(value)) {
      for (const v of value) {
        usp.append(key, v);
      }
    } else {
      usp.append(key, value);
    }
  }

  const queryString = usp.toString();
  return queryString ? `?${queryString}` : undefined;
}

// Get language prefix for URL
function getLanguagePrefix(language?: string): string {
  if (!language || language === 'en') return '';
  return `/${language}`;
}

// Extended page type that may include collection reference
interface PageWithCollection extends Sanity.PageBase {
  collection?: {
    metadata?: {
      slug?: { current: string };
    };
  };
}

// Get path segment based on document type and collection reference
function getPathSegment(page: PageWithCollection): string {
  // For collection documents, use the collection page's slug
  if (
    [
      'collection.blog',
      'collection.changelog',
      'collection.documentation',
      'collection.newsletter',
    ].includes(page._type) &&
    page.collection?.metadata?.slug?.current
  ) {
    return `/${page.collection.metadata.slug.current}`;
  }
  return '';
}

export default function resolveUrl(
  page?: Sanity.PageBase | PageWithCollection,
  {
    base = true,
    params,
    allowList,
  }: {
    base?: boolean;
    params?: string | Record<string, string | string[] | undefined>;
    allowList?: string[];
  } = {}
) {
  if (!page) return '/';

  const slug = page.metadata?.slug?.current;
  const segment = getPathSegment(page as PageWithCollection);
  const path = slug === 'index' ? null : `${segment}/${slug}`;

  const paramsStr =
    typeof params === 'object' && params !== null ? buildQueryString(params, allowList) : params;

  const result = [base && BASE_URL, getLanguagePrefix(page.language), path, stegaClean(paramsStr)]
    .filter(Boolean)
    .join('');

  // Ensure root URL has a trailing slash if base URL is present
  if (base && BASE_URL && result === BASE_URL) {
    return `${BASE_URL}/`;
  }

  return result || '/';
}
