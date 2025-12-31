import { logger } from '@/lib/core/logger';

export interface RetryOptions {
  /** Maximum number of retry attempts (default: 3) */
  retries?: number;
  /** Initial delay in milliseconds (default: 1000) */
  delay?: number;
  /** Backoff multiplier for exponential backoff (default: 2) */
  backoff?: number;
  /** Optional function to determine if error is retryable */
  isRetryable?: (error: unknown) => boolean;
}

/** Patterns indicating retryable errors (network issues, server errors) */
const RETRYABLE_PATTERNS = [
  'fetch failed',
  'econnreset',
  'econnrefused',
  'etimedout',
  'network',
  '500',
  '502',
  '503',
  '504',
];

/**
 * Default check for retryable errors.
 * Retries on network errors and 5xx server errors, not on 4xx client errors.
 */
function defaultIsRetryable(error: unknown): boolean {
  if (!(error instanceof Error)) return true;
  const message = error.message.toLowerCase();
  return RETRYABLE_PATTERNS.some((pattern) => message.includes(pattern));
}

/**
 * Wraps an async function with retry logic and exponential backoff.
 *
 * @example
 * const data = await withRetry(() => fetchSanityLive({ query }));
 *
 * @example
 * // Custom options
 * const data = await withRetry(
 *   () => externalApiCall(),
 *   { retries: 5, delay: 500, backoff: 1.5 }
 * );
 */
export async function withRetry<T>(fn: () => Promise<T>, options: RetryOptions = {}): Promise<T> {
  const { retries = 3, delay = 1000, backoff = 2, isRetryable = defaultIsRetryable } = options;

  let lastError: Error = new Error('No attempts made');

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Don't retry if error is not retryable
      if (!isRetryable(error)) {
        throw lastError;
      }

      // Don't wait after the last attempt
      if (attempt < retries) {
        const waitTime = delay * backoff ** (attempt - 1);
        logger.warn(
          { attempt, retries, waitTime, error: lastError.message },
          'Fetch failed, retrying...'
        );
        await new Promise((resolve) => setTimeout(resolve, waitTime));
      }
    }
  }

  // All retries exhausted
  logger.error({ retries, error: lastError.message }, 'All retry attempts failed');
  throw lastError;
}

/**
 * Wraps a promise with a timeout.
 *
 * @example
 * const data = await withTimeout(fetchData(), 5000, 'Fetch timed out');
 */
export async function withTimeout<T>(
  promise: Promise<T>,
  ms: number,
  message = 'Operation timed out'
): Promise<T> {
  const timeout = new Promise<never>((_, reject) => {
    const id = setTimeout(() => {
      clearTimeout(id);
      reject(new Error(message));
    }, ms);
  });

  return Promise.race([promise, timeout]);
}

/**
 * Creates a debounced version of a function that delays execution until after
 * the specified wait time has elapsed since the last call.
 * Uses AbortController for clean cancellation of pending executions.
 * @param func - The function to debounce
 * @param delay - Wait time in milliseconds (default: 1000)
 * @returns Debounced function that delays execution
 * @example
 * const debouncedSearch = debounce((query) => search(query), 300);
 * debouncedSearch("hello"); // Cancelled if called again within 300ms
 * debouncedSearch("hello world"); // Only this executes after 300ms
 */
export function debounce<T extends (...args: unknown[]) => void>(
  func: T,
  delay = 1000
): (...args: Parameters<T>) => void {
  // Shared reference to the current pending controller
  let abortController: AbortController | null = null;

  return function (this: unknown, ...args: Parameters<T>) {
    // If there's a pending execution, abort it
    if (abortController) {
      abortController.abort();
    }

    // Create a new abort controller scoped to this call
    const currentController = new AbortController();
    abortController = currentController;
    const { signal } = currentController;

    // Create a promise that resolves after the delay
    const delayPromise = new Promise<void>((resolve, reject) => {
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
        // Only clear if this is still the current controller (prevents race condition)
        if (abortController === currentController) {
          abortController = null;
        }
      })
      .catch(() => {
        // Aborted, do nothing
      });
  };
}
