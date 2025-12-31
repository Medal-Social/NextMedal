import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { base64, base64url } from '@/lib/utils/encoding';

describe('encoding utilities', () => {
  describe('base64url', () => {
    it('encodes simple string', () => {
      const result = base64url('hello');
      expect(result).toBeDefined();
      // base64url should not contain +, /, or =
      expect(result).not.toContain('+');
      expect(result).not.toContain('/');
      expect(result).not.toContain('=');
    });

    it('encodes string with special characters', () => {
      const result = base64url('hello world!');
      expect(result).toBeDefined();
      expect(result).not.toContain('+');
      expect(result).not.toContain('/');
    });

    it('encodes unicode string', () => {
      const result = base64url('你好世界');
      expect(result).toBeDefined();
    });

    it('encodes empty string', () => {
      const result = base64url('');
      expect(result).toBe('');
    });

    it('produces consistent output', () => {
      const input = 'test string';
      const result1 = base64url(input);
      const result2 = base64url(input);
      expect(result1).toBe(result2);
    });

    it('encodes string with characters that would produce + in base64', () => {
      // Characters like ? produce + in standard base64
      const result = base64url('???');
      expect(result).not.toContain('+');
    });

    it('encodes string with characters that would produce / in base64', () => {
      const result = base64url('>>>>');
      expect(result).not.toContain('/');
    });
  });

  describe('base64', () => {
    it('encodes simple string', () => {
      const result = base64('hello');
      expect(result).toBe('aGVsbG8=');
    });

    it('encodes string with special characters', () => {
      const result = base64('hello world!');
      expect(result).toBeDefined();
    });

    it('encodes unicode string', () => {
      const result = base64('你好');
      expect(result).toBeDefined();
    });

    it('encodes empty string', () => {
      const result = base64('');
      expect(result).toBe('');
    });

    it('produces standard base64 with padding', () => {
      const result = base64('a');
      // 'a' in base64 should have padding
      expect(result).toContain('=');
    });

    it('produces consistent output', () => {
      const input = 'test string';
      const result1 = base64(input);
      const result2 = base64(input);
      expect(result1).toBe(result2);
    });
  });

  describe('browser fallback', () => {
    const originalBuffer = globalThis.Buffer;

    beforeEach(() => {
      // Simulate browser environment by removing Buffer
      // @ts-expect-error - intentionally setting to undefined to test browser fallback
      globalThis.Buffer = undefined;
    });

    afterEach(() => {
      globalThis.Buffer = originalBuffer;
    });

    it('base64url works in browser environment', () => {
      const result = base64url('hello');
      expect(result).toBeDefined();
      expect(result).not.toContain('+');
      expect(result).not.toContain('/');
      expect(result).not.toContain('=');
    });

    it('base64 works in browser environment', () => {
      const result = base64('hello');
      expect(result).toBeDefined();
    });
  });
});
