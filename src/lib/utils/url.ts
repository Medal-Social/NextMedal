/**
 * Normalizes a URL to ensure it has the correct protocol and format.
 * Uses the URL API for proper validation and normalization.
 *
 * @param url - The URL string to normalize
 * @param forceHttps - If true, converts http:// to https://
 * @returns Normalized URL without trailing slash, or empty string if invalid
 */
export function normalizeUrl(url: string | undefined, forceHttps = false): string {
  if (!url) return '';

  const trimmed = url.trim();
  if (!trimmed) return '';

  // Prepend https:// if no protocol is present
  const withProtocol =
    trimmed.startsWith('http://') || trimmed.startsWith('https://')
      ? trimmed
      : `https://${trimmed}`;

  try {
    const parsed = new URL(withProtocol);

    // Force https if requested
    if (forceHttps && parsed.protocol === 'http:') {
      parsed.protocol = 'https:';
    }

    // Return origin (protocol + host) without trailing slash
    // Using origin instead of href to exclude paths/query strings for base URLs
    return parsed.origin;
  } catch {
    // Invalid URL, return empty string
    return '';
  }
}
