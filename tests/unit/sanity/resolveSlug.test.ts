import { describe, expect, it } from 'vitest';
import resolveSlug from '@/sanity/lib/resolveSlug';

describe('resolveSlug', () => {
  describe('external URLs', () => {
    it('should return external URL as-is', () => {
      expect(
        resolveSlug({
          external: 'https://example.com',
        })
      ).toBe('https://example.com');
    });

    it('should prioritize external over internal', () => {
      expect(
        resolveSlug({
          external: 'https://example.com',
          internal: 'about',
        })
      ).toBe('https://example.com');
    });
  });

  describe('internal URLs', () => {
    it('should return root path for index', () => {
      expect(
        resolveSlug({
          internal: 'index',
        })
      ).toBe('/');
    });

    it('should return path with leading slash', () => {
      expect(
        resolveSlug({
          internal: 'about',
        })
      ).toBe('/about');
    });

    it('should handle nested paths', () => {
      expect(
        resolveSlug({
          internal: 'articles/my-post',
        })
      ).toBe('/articles/my-post');
    });
  });

  describe('anchor/hash params', () => {
    it('should append anchor with # prefix when provided', () => {
      expect(
        resolveSlug({
          internal: 'about',
          params: '#contact',
        })
      ).toBe('/about#contact');
    });

    it('should add # prefix if missing (defensive)', () => {
      expect(
        resolveSlug({
          internal: 'about',
          params: 'contact',
        })
      ).toBe('/about#contact');
    });

    it('should handle anchor on index page', () => {
      expect(
        resolveSlug({
          internal: 'index',
          params: '#hero',
        })
      ).toBe('/#hero');
    });

    it('should handle anchor without # prefix on index page', () => {
      expect(
        resolveSlug({
          internal: 'index',
          params: 'hero',
        })
      ).toBe('/#hero');
    });

    it('should handle nested path with anchor', () => {
      expect(
        resolveSlug({
          internal: 'articles/my-post',
          params: '#comments',
        })
      ).toBe('/articles/my-post#comments');
    });

    it('should handle nested path with anchor without # prefix', () => {
      expect(
        resolveSlug({
          internal: 'articles/my-post',
          params: 'comments',
        })
      ).toBe('/articles/my-post#comments');
    });

    it('should not double-add # prefix', () => {
      expect(
        resolveSlug({
          internal: 'about',
          params: '#contact',
        })
      ).toBe('/about#contact');
    });
  });

  describe('edge cases', () => {
    it('should return undefined when no params provided', () => {
      expect(resolveSlug({})).toBeUndefined();
    });

    it('should ignore params without internal or external', () => {
      expect(
        resolveSlug({
          params: '#contact',
        })
      ).toBeUndefined();
    });

    it('should return undefined for empty string internal', () => {
      expect(
        resolveSlug({
          internal: '',
        })
      ).toBeUndefined();
    });

    it('should handle empty string params', () => {
      expect(
        resolveSlug({
          internal: 'about',
          params: '',
        })
      ).toBe('/about');
    });

    it('should add # before whitespace if params has leading whitespace', () => {
      expect(
        resolveSlug({
          internal: 'about',
          params: '  contact  ',
        })
      ).toBe('/about#  contact  ');
    });
  });

  describe('type parameter', () => {
    it('should accept _type but not use it for URL resolution', () => {
      expect(
        resolveSlug({
          _type: 'page',
          internal: 'about',
        })
      ).toBe('/about');
    });
  });
});
