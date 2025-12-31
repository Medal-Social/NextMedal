import { afterEach, describe, expect, it, vi } from 'vitest';
import { z } from 'zod';
import { PublicError } from '@/lib/core/errors';
import { logger } from '@/lib/core/logger';
import { errorHandler, withSecurity } from '@/lib/core/safe-action';

// Mock logger (must match the actual import path in core/safe-action.ts)
vi.mock('@/lib/core/logger', () => ({
  logger: {
    error: vi.fn(),
  },
}));

describe('errorHandler', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should return "Internal server error" for standard Error', () => {
    const error = new Error('Secret DB info');
    const result = errorHandler(error);

    expect(result).toBe('Internal server error');
    expect(logger.error).toHaveBeenCalledWith(error, 'Server action error');
  });

  it('should return specific message for PublicError', () => {
    const error = new PublicError('Invalid input');
    const result = errorHandler(error);

    expect(result).toBe('Invalid input');
    expect(logger.error).toHaveBeenCalledWith(error, 'Server action error');
  });

  it('should return "Internal server error" for non-Error objects', () => {
    const error = 'Something went wrong string';
    const result = errorHandler(error);

    expect(result).toBe('Internal server error');
    expect(logger.error).toHaveBeenCalledWith(error, 'Server action error');
  });
});

describe('withSecurity', () => {
  const schema = withSecurity(z.object({ name: z.string() }));

  it('should pass if submission takes longer than 3 seconds', () => {
    const start = Date.now() - 4000;
    const result = schema.safeParse({
      name: 'test',
      _submissionTimestamp: new Date(start).toISOString(),
    });
    expect(result.success).toBe(true);
  });

  it('should fail if submission is too fast', () => {
    const start = Date.now() - 1000;
    const result = schema.safeParse({
      name: 'test',
      _submissionTimestamp: new Date(start).toISOString(),
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      // Use issues instead of errors if errors is problematic in this env
      expect(result.error.issues).toBeDefined();
      expect(result.error.issues.length).toBeGreaterThan(0);
      expect(result.error.issues[0].message).toBe(
        'Submission too fast. Please wait a moment and try again.'
      );
    }
  });

  it('should pass if timestamp is invalid (NaN)', () => {
    const result = schema.safeParse({
      name: 'test',
      _submissionTimestamp: 'invalid-date',
    });
    expect(result.success).toBe(true);
  });

  it('should pass if timestamp is missing', () => {
    const result = schema.safeParse({
      name: 'test',
    });
    expect(result.success).toBe(true);
  });
});
