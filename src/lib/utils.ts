import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function count(
  arr: Array<unknown> | number | null | undefined,
  singular = 'item',
  plural?: string
) {
  const n = typeof arr === 'number' ? arr : arr?.length || 0;
  return `${n} ${n === 1 ? singular : plural || `${singular}s`}`;
}

export function debounce<T extends (...args: unknown[]) => void>(
  func: T,
  delay = 1000 // 1 sec
): (...args: Parameters<T>) => void {
  // Use an AbortController for better cleanup
  let abortController: AbortController | null = null;

  return function (this: unknown, ...args: Parameters<T>) {
    // If there's a pending execution, abort it
    if (abortController) {
      abortController.abort();
    }

    // Create a new abort controller for this execution
    abortController = new AbortController();
    const { signal } = abortController;

    // Create a promise that resolves after the delay
    const delayPromise = new Promise<void>((resolve, reject) => {
      // Setup the timeout
      const timeoutId = setTimeout(() => {
        resolve();
      }, delay);

      // If aborted, clear the timeout and reject
      signal.addEventListener('abort', () => {
        clearTimeout(timeoutId);
        reject(new Error('Debounce aborted'));
      });
    });

    // Execute the function after the delay if not aborted
    delayPromise
      .then(() => {
        if (!signal.aborted) {
          func.apply(this, args);
        }
        abortController = null;
      })
      .catch(() => {
        // Aborted, do nothing
      });
  };
}

export const { format: formatCurrency } = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

export function slug(str: string) {
  return str
    .toLowerCase()
    .replace(/[\s\W]+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

/**
 * Encodes a string to a URL-safe Base64 string (base64url).
 * Works in both Node.js and browser environments.
 */
export function base64url(str: string): string {
  if (typeof Buffer !== 'undefined') {
    // Use standard base64 and convert to base64url format
    // ('base64url' encoding is not available in all runtimes like Edge)
    return Buffer.from(str)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  }

  // Browser fallback
  const utf8Bytes = new TextEncoder().encode(str);
  const binaryStr = Array.from(utf8Bytes, (byte) => String.fromCharCode(byte)).join('');
  return btoa(binaryStr).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/**
 * Encodes a string to a standard Base64 string.
 * Works in both Node.js and browser environments.
 */
export function base64(str: string): string {
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(str).toString('base64');
  }

  // Browser fallback
  const utf8Bytes = new TextEncoder().encode(str);
  const binaryStr = Array.from(utf8Bytes, (byte) => String.fromCharCode(byte)).join('');
  return btoa(binaryStr);
}

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
