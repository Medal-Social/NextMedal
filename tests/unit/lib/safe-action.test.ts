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

  it('should return generic user-friendly message for standard Error', () => {
    const error = new Error('Secret DB info');
    const result = errorHandler(error);

    expect(result).toBe(
      'Something went wrong. Please try again or contact support if the problem persists.'
    );
    expect(logger.error).toHaveBeenCalledWith(error, 'Server action error');
  });

  it('should return specific message for PublicError', () => {
    const error = new PublicError('Invalid input');
    const result = errorHandler(error);

    expect(result).toBe('Invalid input');
    expect(logger.error).toHaveBeenCalledWith(error, 'Server action error');
  });

  it('should return generic user-friendly message for non-Error objects', () => {
    const error = 'Something went wrong string';
    const result = errorHandler(error);

    expect(result).toBe(
      'Something went wrong. Please try again or contact support if the problem persists.'
    );
    expect(logger.error).toHaveBeenCalledWith(error, 'Server action error');
  });

  it('should return refresh message for Server Action errors during deployment', () => {
    const error = new Error(
      'Failed to find Server Action "submit". This request might be from an older or newer deployment.'
    );
    const result = errorHandler(error);

    expect(result).toBe('Something went wrong. Please refresh the page and try again.');
    expect(logger.error).toHaveBeenCalledWith(error, 'Server action error');
  });

  it('should handle null errors', () => {
    const result = errorHandler(null);

    expect(result).toBe(
      'Something went wrong. Please try again or contact support if the problem persists.'
    );
    expect(logger.error).toHaveBeenCalledWith(null, 'Server action error');
  });

  it('should handle undefined errors', () => {
    const result = errorHandler(undefined);

    expect(result).toBe(
      'Something went wrong. Please try again or contact support if the problem persists.'
    );
    expect(logger.error).toHaveBeenCalledWith(undefined, 'Server action error');
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
      expect(result.error.issues).toBeDefined();
      expect(result.error.issues.length).toBeGreaterThan(0);
      expect(result.error.issues[0].message).toBe(
        'Please take a moment to review your information before submitting.'
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

  describe('honeypot field', () => {
    it('should pass if honeypot is empty string', () => {
      const result = schema.safeParse({
        name: 'test',
        _honeypot: '',
      });
      expect(result.success).toBe(true);
    });

    it('should pass if honeypot is undefined', () => {
      const result = schema.safeParse({
        name: 'test',
        _honeypot: undefined,
      });
      expect(result.success).toBe(true);
    });

    it('should fail if honeypot has content (bot detected)', () => {
      const result = schema.safeParse({
        name: 'test',
        _honeypot: 'bot value',
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues).toBeDefined();
        expect(result.error.issues[0].message).toBe(
          'Please complete all fields correctly and try again.'
        );
      }
    });
  });

  it('should pass at exactly 3 seconds', () => {
    const start = Date.now() - 3000;
    const result = schema.safeParse({
      name: 'test',
      _submissionTimestamp: new Date(start).toISOString(),
    });
    expect(result.success).toBe(true);
  });

  it('should validate the base schema fields', () => {
    const result = schema.safeParse({
      name: 123, // should be string
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain('name');
    }
  });

  it('should work with complex schemas', () => {
    const complexSchema = withSecurity(
      z.object({
        email: z.string().email(),
        age: z.number().min(18),
      })
    );

    const result = complexSchema.safeParse({
      email: 'test@example.com',
      age: 25,
    });

    expect(result.success).toBe(true);
  });
});
