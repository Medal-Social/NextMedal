import { describe, expect, it } from 'vitest';
import { PublicError } from '@/lib/core/errors';

describe('PublicError', () => {
  it('creates an error with the given message', () => {
    const error = new PublicError('Something went wrong');

    expect(error.message).toBe('Something went wrong');
  });

  it('has the name "PublicError"', () => {
    const error = new PublicError('Test error');

    expect(error.name).toBe('PublicError');
  });

  it('is an instance of Error', () => {
    const error = new PublicError('Test error');

    expect(error).toBeInstanceOf(Error);
  });

  it('is an instance of PublicError', () => {
    const error = new PublicError('Test error');

    expect(error).toBeInstanceOf(PublicError);
  });

  it('has a stack trace', () => {
    const error = new PublicError('Test error');

    expect(error.stack).toBeDefined();
    expect(error.stack).toContain('PublicError');
  });

  it('can be thrown and caught', () => {
    expect(() => {
      throw new PublicError('Thrown error');
    }).toThrow(PublicError);

    expect(() => {
      throw new PublicError('Thrown error');
    }).toThrow('Thrown error');
  });

  it('works with try-catch', () => {
    try {
      throw new PublicError('Caught error');
    } catch (error) {
      expect(error).toBeInstanceOf(PublicError);
      if (error instanceof PublicError) {
        expect(error.message).toBe('Caught error');
        expect(error.name).toBe('PublicError');
      }
    }
  });

  it('can be distinguished from regular Error', () => {
    const publicError = new PublicError('Public');
    const regularError = new Error('Regular');

    expect(publicError instanceof PublicError).toBe(true);
    expect(regularError instanceof PublicError).toBe(false);
  });

  it('handles empty message', () => {
    const error = new PublicError('');

    expect(error.message).toBe('');
    expect(error.name).toBe('PublicError');
  });

  it('handles special characters in message', () => {
    const message = 'Error: <script>alert("xss")</script> & "quotes"';
    const error = new PublicError(message);

    expect(error.message).toBe(message);
  });

  it('handles unicode in message', () => {
    const message = 'Feil: Noe gikk galt 🚨 エラー';
    const error = new PublicError(message);

    expect(error.message).toBe(message);
  });
});
