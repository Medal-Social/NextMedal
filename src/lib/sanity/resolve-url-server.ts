import 'server-only';
import { stegaClean } from 'next-sanity';
import { routing } from '@/i18n/routing';
import { getCollectionSlugWithFallback } from '@/lib/collections/registry';
import { COLLECTION_TYPES, type CollectionType } from '@/lib/collections/types';
import { BASE_URL } from '@/lib/core/env';

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
  if (!language || language === routing.defaultLocale) return '';
  return `/${language}`;
}

// Get path segment based on document type using registry (now synchronous!)
function getPathSegment(page: Sanity.PageBase): string {
  // For collection documents, get the slug from registry
  if (COLLECTION_TYPES.includes(page._type as CollectionType)) {
    const slug = getCollectionSlugWithFallback(
      page._type as CollectionType,
      page.language || routing.defaultLocale
    );

    return `/${slug}`;
  }
  return '';
}

// Server-side URL resolver (now synchronous with registry!)
export default function resolveUrl(
  page?: Sanity.PageBase,
  {
    base = true,
    params,
    allowList,
  }: {
    base?: boolean;
    params?: string | Record<string, string | string[] | undefined>;
    allowList?: string[];
  } = {}
): string {
  if (!page) return '/';

  const slug = page.metadata?.slug?.current;
  const segment = getPathSegment(page);
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
