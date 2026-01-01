/**
 * Generate fallback OG image parameters for articles without custom images
 */
export function getArticleFallbackImage(
  title?: string,
  description?: string
): { src: string; alt: string; width: number; height: number } {
  const params = new URLSearchParams();
  if (title) params.set('title', title.slice(0, 100));
  if (description) params.set('description', description.slice(0, 150));

  return {
    src: `/api/og/article-fallback?${params.toString()}`,
    alt: title || '',
    width: 1200,
    height: 630,
  };
}
