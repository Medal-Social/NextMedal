import { stegaClean } from 'next-sanity';

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
    return base ? `${process.env.NEXT_PUBLIC_BASE_URL || ''}${cleanUrl}` : cleanUrl;
  }

  // If it's an external URL, return it as-is
  return cleanUrl;
}

export default function resolveUrl(
  page?: Sanity.PageBase,
  {
    base = true,
    params,
  }: {
    base?: boolean;
    params?: string | Record<string, string>;
  } = {}
) {
  if (!page) return '/';

  // Handle blog posts
  const segment = page._type === 'blog.post' ? '/blog/' : '/';

  const slug = page.metadata?.slug?.current;
  const path = slug === 'index' ? null : slug;

  // Convert params to string if it's a record
  let paramsStr: string | undefined;
  if (typeof params === 'object' && params !== null) {
    const usp = new URLSearchParams(params as Record<string, string>);
    paramsStr = usp.toString() ? `?${usp.toString()}` : undefined;
  } else {
    paramsStr = params;
  }

  return [
    base && process.env.NEXT_PUBLIC_BASE_URL,
    !page.language ? '' : page.language === 'en' ? '' : `/${page.language}`,
    segment,
    page.parent
      ? [...page.parent.map((p) => p?.metadata?.slug?.current), path].filter(Boolean).join('/')
      : path,
    stegaClean(paramsStr),
  ]
    .filter(Boolean)
    .join('');
}
