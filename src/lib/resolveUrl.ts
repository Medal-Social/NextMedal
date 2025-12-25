import { stegaClean } from 'next-sanity';
import { BASE_URL } from './env';

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
) {
  if (!page) return '/';

  const slug = page.metadata?.slug?.current;
  const path = slug === 'index' ? null : `/${slug}`;

  // Convert params to string if it's a record
  let paramsStr: string | undefined;
  if (typeof params === 'object' && params !== null) {
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
    paramsStr = usp.toString() ? `?${usp.toString()}` : undefined;
  } else {
    paramsStr = params;
  }

  const result = [
    base && BASE_URL,
    !page.language ? '' : page.language === 'en' ? '' : `/${page.language}`,
    path,
    stegaClean(paramsStr),
  ]
    .filter(Boolean)
    .join('');

  // Ensure root URL has a trailing slash if base URL is present
  if (base && BASE_URL && result === BASE_URL) {
    return `${BASE_URL}/`;
  }

  return result || '/';
}
