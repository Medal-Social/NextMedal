import { describe, expect, it } from 'vitest';
import { count, slug } from '@/lib/utils/strings';

describe('string utilities', () => {
  describe('slug', () => {
    it('converts string to lowercase', () => {
      expect(slug('HELLO WORLD')).toBe('hello-world');
    });

    it('replaces spaces with hyphens', () => {
      expect(slug('hello world')).toBe('hello-world');
    });

    it('removes special characters', () => {
      expect(slug('Hello World!')).toBe('hello-world');
      expect(slug('My Article #1')).toBe('my-article-1');
    });

    it('removes leading hyphens', () => {
      expect(slug('  hello world')).toBe('hello-world');
    });

    it('removes trailing hyphens', () => {
      expect(slug('hello world  ')).toBe('hello-world');
    });

    it('handles multiple spaces', () => {
      expect(slug('hello    world')).toBe('hello-world');
    });

    it('handles empty string', () => {
      expect(slug('')).toBe('');
    });

    it('handles string with only special characters', () => {
      expect(slug('!@#$%')).toBe('');
    });

    it('handles unicode characters', () => {
      const result = slug('Héllo Wörld');
      expect(result).toBe('h-llo-w-rld');
    });
  });

  describe('count', () => {
    it('formats array count with default singular/plural', () => {
      expect(count([1, 2, 3])).toBe('3 items');
    });

    it('uses singular form for count of 1', () => {
      expect(count([1], 'post')).toBe('1 post');
    });

    it('uses plural form for count > 1', () => {
      expect(count([1, 2], 'post')).toBe('2 posts');
    });

    it('uses custom plural form', () => {
      expect(count([1, 2], 'person', 'people')).toBe('2 people');
    });

    it('handles number input', () => {
      expect(count(5, 'item')).toBe('5 items');
      expect(count(1, 'item')).toBe('1 item');
    });

    it('handles null input as 0', () => {
      expect(count(null, 'result')).toBe('0 results');
    });

    it('handles undefined input as 0', () => {
      expect(count(undefined, 'result')).toBe('0 results');
    });

    it('handles empty array', () => {
      expect(count([], 'item')).toBe('0 items');
    });

    it('handles zero number input', () => {
      expect(count(0, 'item')).toBe('0 items');
    });

    it('uses default singular form', () => {
      expect(count([1])).toBe('1 item');
    });
  });
});
