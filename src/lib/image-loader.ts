import { base64url } from './utils';

export default function imageLoader({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number;
}): string {
  const proxyUrl = process.env.NEXT_PUBLIC_IMAGE_PROXY_URL;

  // If no proxy URL is configured, return the original source
  if (!proxyUrl) {
    return src;
  }

  // Handle absolute vs relative URLs
  // If it's a relative path, we need to make it absolute for the proxy
  let sourceUrl = src;

  if (src.startsWith('/')) {
    // Prefer environment variable for base URL
    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL ||
      (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');

    // Remove double slashes if they occur
    sourceUrl = `${baseUrl.replace(/\/$/, '')}/${src.replace(/^\//, '')}`;
  }

  // Encode the URL for imgproxy using cross-platform base64url
  const encodedUrl = base64url(sourceUrl);

  // Imgproxy processing options
  const resizingType = 'fit';
  const gravity = 'no';
  const enlarge = 0;
  const extension = 'webp';

  const processingOptions = `rs:${resizingType}:${width}:0:${enlarge}/g:${gravity}/q:${quality || 75}`;

  const path = `/${processingOptions}/${encodedUrl}.${extension}`;

  // NOTE: Signing is not implemented. If required in the future, use a
  // Next.js API route with server-only IMAGE_PROXY_KEY/SALT env vars.

  // Use insecure mode (ensure your imgproxy instance allows this or whitelist domains)
  return `${proxyUrl}/insecure${path}`;
}
