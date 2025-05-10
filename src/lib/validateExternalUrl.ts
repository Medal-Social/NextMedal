/**
 * Validates and sanitizes external URLs to prevent security issues
 * @param url The URL to validate and sanitize
 * @returns The sanitized URL if valid, or null if invalid
 */
export function validateExternalUrl(url: string): string | null {
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

    // Only allow http and https protocols
    if (protocol !== 'http:' && protocol !== 'https:') {
      return null;
    }

    // Return the sanitized URL
    return urlObject.toString();
  } catch (_error) {
    // If URL parsing fails, return null
    return null;
  }
}
