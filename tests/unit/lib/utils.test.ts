import { describe, expect, it } from 'vitest';
import { cn, count, slug } from '@/lib/utils/index';

describe('utils', () => {
  describe('cn', () => {
    it('merges tailwind classes', () => {
      expect(cn('px-2', 'py-2')).toBe('px-2 py-2');
      expect(cn('px-2', 'px-4')).toBe('px-4');
    });
  });

  describe('count', () => {
    it('returns singular form for 1 item', () => {
      expect(count(1, 'item')).toBe('1 item');
      expect(count([1], 'item')).toBe('1 item');
    });

    it('returns plural form for multiple items', () => {
      expect(count(2, 'item')).toBe('2 items');
      expect(count([1, 2], 'item')).toBe('2 items');
    });

    it('uses custom plural form', () => {
      expect(count(2, 'person', 'people')).toBe('2 people');
    });
  });

  describe('slug', () => {
    it('converts string to slug', () => {
      expect(slug('Hello World')).toBe('hello-world');
      expect(slug('Hello & World!')).toBe('hello-world');
    });
  });
});
