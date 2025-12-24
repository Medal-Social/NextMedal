/**
 * Validates and sanitizes external URLs to prevent security issues
 * @param url The URL to validate and sanitize
 * @returns The sanitized URL if valid, or null if invalid
 */
export function validateExternalUrl(url: string): string | null {
  if (!url) return null;

  // Allow anchor links
  if (url.startsWith('#')) {
    return url;
  }

  // Allow mailto and tel links
  if (url.startsWith('mailto:') || url.startsWith('tel:')) {
    return url;
  }

  try {
    // Try to create a URL object to validate the URL
    const urlObject = new URL(url);

    // Check for dangerous protocols
    const protocol = urlObject.protocol.toLowerCase();
    if (
      protocol === 'javascript:' ||
      protocol === 'data:' ||
      protocol === 'vbscript:' ||
      protocol === 'file:'
    ) {
      return null;
    }

    // Only allow http and https protocols (mailto and tel already handled above if not parsed by URL)
    if (
      protocol !== 'http:' &&
      protocol !== 'https:' &&
      protocol !== 'mailto:' &&
      protocol !== 'tel:'
    ) {
      return null;
    }

    // Return the sanitized URL
    return urlObject.toString();
  } catch (_error) {
    // If URL parsing fails, check if it's a relative URL or anchor that didn't start with #
    if (url.startsWith('/') || url.startsWith('?')) {
      return url;
    }

    // For other cases (like just "example.com"), we might want to assume https:// or return null
    // Here we choose to return null to be safe and require protocol
    return null;
  }
}
