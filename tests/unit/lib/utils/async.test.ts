import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { debounce, withRetry, withTimeout } from '@/lib/utils/async';

// Mock logger
vi.mock('@/lib/core/logger', () => ({
  logger: {
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

describe('async utilities', () => {
  afterEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  describe('withRetry', () => {
    it('returns result on first successful attempt', async () => {
      const fn = vi.fn().mockResolvedValue('success');
      const result = await withRetry(fn);
      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('retries on failure and succeeds eventually', async () => {
      const fn = vi
        .fn()
        .mockRejectedValueOnce(new Error('fetch failed'))
        .mockResolvedValue('success');

      // Use minimal delay for faster tests
      const result = await withRetry(fn, { retries: 2, delay: 1 });
      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(2);
    });

    it('throws after all retries exhausted', async () => {
      const fn = vi.fn().mockRejectedValue(new Error('fetch failed'));

      await expect(withRetry(fn, { retries: 2, delay: 1 })).rejects.toThrow('fetch failed');
      expect(fn).toHaveBeenCalledTimes(2);
    });

    it('does not retry non-retryable errors', async () => {
      const fn = vi.fn().mockRejectedValue(new Error('Not found 404'));

      // 404 is not in the retryable patterns
      await expect(withRetry(fn, { retries: 3 })).rejects.toThrow('Not found 404');
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('uses custom isRetryable function', async () => {
      const fn = vi
        .fn()
        .mockRejectedValueOnce(new Error('custom error'))
        .mockResolvedValue('success');

      const result = await withRetry(fn, {
        retries: 3,
        delay: 1,
        isRetryable: (error) => error instanceof Error && error.message === 'custom error',
      });

      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(2);
    });

    it('does not retry when custom isRetryable returns false', async () => {
      const fn = vi.fn().mockRejectedValue(new Error('do not retry'));

      await expect(
        withRetry(fn, {
          retries: 3,
          delay: 1,
          isRetryable: () => false,
        })
      ).rejects.toThrow('do not retry');

      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('retries on non-Error objects', async () => {
      const fn = vi.fn().mockRejectedValueOnce('string error').mockResolvedValue('success');

      const result = await withRetry(fn, { retries: 2, delay: 1 });
      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(2);
    });

    it('retries on 500 server errors', async () => {
      const fn = vi
        .fn()
        .mockRejectedValueOnce(new Error('Server returned 500'))
        .mockResolvedValue('success');

      const result = await withRetry(fn, { retries: 2, delay: 1 });
      expect(result).toBe('success');
    });

    it('retries on 502 gateway errors', async () => {
      const fn = vi
        .fn()
        .mockRejectedValueOnce(new Error('Bad Gateway 502'))
        .mockResolvedValue('success');

      const result = await withRetry(fn, { retries: 2, delay: 1 });
      expect(result).toBe('success');
    });

    it('retries on 503 service unavailable', async () => {
      const fn = vi
        .fn()
        .mockRejectedValueOnce(new Error('Service unavailable 503'))
        .mockResolvedValue('success');

      const result = await withRetry(fn, { retries: 2, delay: 1 });
      expect(result).toBe('success');
    });

    it('retries on 504 gateway timeout', async () => {
      const fn = vi
        .fn()
        .mockRejectedValueOnce(new Error('Gateway timeout 504'))
        .mockResolvedValue('success');

      const result = await withRetry(fn, { retries: 2, delay: 1 });
      expect(result).toBe('success');
    });

    it('retries on network errors', async () => {
      const fn = vi
        .fn()
        .mockRejectedValueOnce(new Error('ECONNRESET'))
        .mockResolvedValue('success');

      const result = await withRetry(fn, { retries: 2, delay: 1 });
      expect(result).toBe('success');
    });

    it('retries on ECONNREFUSED', async () => {
      const fn = vi
        .fn()
        .mockRejectedValueOnce(new Error('ECONNREFUSED'))
        .mockResolvedValue('success');

      const result = await withRetry(fn, { retries: 2, delay: 1 });
      expect(result).toBe('success');
    });

    it('retries on ETIMEDOUT', async () => {
      const fn = vi.fn().mockRejectedValueOnce(new Error('ETIMEDOUT')).mockResolvedValue('success');

      const result = await withRetry(fn, { retries: 2, delay: 1 });
      expect(result).toBe('success');
    });

    it('retries on fetch failed', async () => {
      const fn = vi
        .fn()
        .mockRejectedValueOnce(new Error('fetch failed'))
        .mockResolvedValue('success');

      const result = await withRetry(fn, { retries: 2, delay: 1 });
      expect(result).toBe('success');
    });

    it('retries on network error', async () => {
      const fn = vi
        .fn()
        .mockRejectedValueOnce(new Error('network error'))
        .mockResolvedValue('success');

      const result = await withRetry(fn, { retries: 2, delay: 1 });
      expect(result).toBe('success');
    });
  });

  describe('withTimeout', () => {
    it('resolves before timeout', async () => {
      const promise = Promise.resolve('result');
      const result = await withTimeout(promise, 1000);
      expect(result).toBe('result');
    });

    it('rejects when timeout is exceeded', async () => {
      const slowPromise = new Promise((resolve) => {
        setTimeout(() => resolve('slow'), 200);
      });

      await expect(withTimeout(slowPromise, 50)).rejects.toThrow('Operation timed out');
    });

    it('uses custom timeout message', async () => {
      const slowPromise = new Promise((resolve) => {
        setTimeout(() => resolve('slow'), 200);
      });

      await expect(withTimeout(slowPromise, 50, 'Custom timeout message')).rejects.toThrow(
        'Custom timeout message'
      );
    });

    it('does not reject if promise resolves in time', async () => {
      const fastPromise = new Promise((resolve) => {
        setTimeout(() => resolve('fast'), 10);
      });

      const result = await withTimeout(fastPromise, 500);
      expect(result).toBe('fast');
    });

    it('propagates rejection from the original promise', async () => {
      const failingPromise = Promise.reject(new Error('Original error'));

      await expect(withTimeout(failingPromise, 1000)).rejects.toThrow('Original error');
    });
  });

  describe('debounce', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    it('delays function execution', async () => {
      const fn = vi.fn();
      const debounced = debounce(fn, 300);

      debounced('arg1');

      expect(fn).not.toHaveBeenCalled();

      await vi.advanceTimersByTimeAsync(300);

      expect(fn).toHaveBeenCalledTimes(1);
      expect(fn).toHaveBeenCalledWith('arg1');
    });

    it('cancels previous calls when called rapidly', async () => {
      const fn = vi.fn();
      const debounced = debounce(fn, 300);

      debounced('first');
      debounced('second');
      debounced('third');

      await vi.advanceTimersByTimeAsync(300);

      expect(fn).toHaveBeenCalledTimes(1);
      expect(fn).toHaveBeenCalledWith('third');
    });

    it('executes each call if spaced apart', async () => {
      const fn = vi.fn();
      const debounced = debounce(fn, 100);

      debounced('first');
      await vi.advanceTimersByTimeAsync(100);

      debounced('second');
      await vi.advanceTimersByTimeAsync(100);

      expect(fn).toHaveBeenCalledTimes(2);
      expect(fn).toHaveBeenNthCalledWith(1, 'first');
      expect(fn).toHaveBeenNthCalledWith(2, 'second');
    });

    it('uses default delay of 1000ms', async () => {
      const fn = vi.fn();
      const debounced = debounce(fn);

      debounced('arg');

      await vi.advanceTimersByTimeAsync(999);
      expect(fn).not.toHaveBeenCalled();

      await vi.advanceTimersByTimeAsync(1);
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('passes multiple arguments correctly', async () => {
      const fn = vi.fn();
      const debounced = debounce(fn, 100);

      debounced('arg1', 'arg2', 'arg3');

      await vi.advanceTimersByTimeAsync(100);

      expect(fn).toHaveBeenCalledWith('arg1', 'arg2', 'arg3');
    });

    it('resets timer when called again before delay', async () => {
      const fn = vi.fn();
      const debounced = debounce(fn, 200);

      debounced('first');
      await vi.advanceTimersByTimeAsync(100);
      expect(fn).not.toHaveBeenCalled();

      debounced('second');
      await vi.advanceTimersByTimeAsync(100);
      expect(fn).not.toHaveBeenCalled();

      await vi.advanceTimersByTimeAsync(100);
      expect(fn).toHaveBeenCalledTimes(1);
      expect(fn).toHaveBeenCalledWith('second');
    });
  });
});
