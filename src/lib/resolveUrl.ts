import { stegaClean } from 'next-sanity';

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
    segment,
    page.parent
      ? [...page.parent.map((p) => p?.metadata?.slug?.current), path].filter(Boolean).join('/')
      : path,
    stegaClean(paramsStr),
  ]
    .filter(Boolean)
    .join('');
}
