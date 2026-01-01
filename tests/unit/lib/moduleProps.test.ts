import { describe, expect, it, vi } from 'vitest';

// Mock next-sanity stegaClean to return the input as-is (or undefined if not provided)
vi.mock('next-sanity', () => ({
  stegaClean: (value: unknown) => value,
}));

import moduleProps from '@/lib/sanity/module-props';

describe('moduleProps', () => {
  describe('id generation', () => {
    it('uses options.anchorId when provided', () => {
      const result = moduleProps({
        _type: 'banner',
        _key: 'abc123',
        options: { anchorId: 'custom-id' },
      });

      expect(result.id).toBe('custom-id');
    });

    it('falls back to module-{_key} when anchorId is not provided', () => {
      const result = moduleProps({
        _type: 'banner',
        _key: 'abc123',
      });

      expect(result.id).toBe('module-abc123');
    });

    it('falls back to module-{_key} when options is undefined', () => {
      const result = moduleProps({
        _type: 'cta',
        _key: 'xyz789',
      });

      expect(result.id).toBe('module-xyz789');
    });

    it('falls back to module-{_key} when anchorId is empty string', () => {
      const result = moduleProps({
        _type: 'hero',
        _key: 'key123',
        options: { anchorId: '' },
      });

      expect(result.id).toBe('module-key123');
    });
  });

  describe('data-module attribute', () => {
    it('sets data-module to the _type value', () => {
      const result = moduleProps({
        _type: 'testimonials',
        _key: 'test123',
      });

      expect(result['data-module']).toBe('testimonials');
    });

    it('handles various module types', () => {
      const types = ['banner', 'cta', 'hero', 'faq', 'pricing', 'article-list'];

      for (const type of types) {
        const result = moduleProps({
          _type: type,
          _key: 'key',
        });
        expect(result['data-module']).toBe(type);
      }
    });
  });

  describe('spacing prop', () => {
    it('includes spacing when provided', () => {
      const result = moduleProps({
        _type: 'banner',
        _key: 'key',
        spacing: 'compact',
      });

      expect(result.spacing).toBe('compact');
    });

    it('does not include spacing when not provided', () => {
      const result = moduleProps({
        _type: 'banner',
        _key: 'key',
      });

      expect(result).not.toHaveProperty('spacing');
    });

    it('does not include spacing when undefined', () => {
      const result = moduleProps({
        _type: 'banner',
        _key: 'key',
        spacing: undefined,
      });

      expect(result).not.toHaveProperty('spacing');
    });

    it('handles string spacing', () => {
      const result = moduleProps({
        _type: 'banner',
        _key: 'key',
        spacing: 'relaxed',
      });

      expect(result.spacing).toBe('relaxed');
    });
  });

  describe('width prop', () => {
    it('includes width when provided', () => {
      const result = moduleProps({
        _type: 'banner',
        _key: 'key',
        width: 'full',
      });

      expect(result.width).toBe('full');
    });

    it('does not include width when not provided', () => {
      const result = moduleProps({
        _type: 'banner',
        _key: 'key',
      });

      expect(result).not.toHaveProperty('width');
    });

    it('does not include width when undefined', () => {
      const result = moduleProps({
        _type: 'banner',
        _key: 'key',
        width: undefined,
      });

      expect(result).not.toHaveProperty('width');
    });

    it('handles various width values', () => {
      const widths = ['narrow', 'default', 'wide', 'full'] as const;

      for (const width of widths) {
        const result = moduleProps({
          _type: 'banner',
          _key: 'key',
          width,
        });
        expect(result.width).toBe(width);
      }
    });
  });

  describe('combined props', () => {
    it('returns all props when all are provided', () => {
      const result = moduleProps({
        _type: 'hero',
        _key: 'hero-1',
        options: { anchorId: 'main-hero' },
        spacing: 'relaxed',
        width: 'wide',
      });

      expect(result).toEqual({
        id: 'main-hero',
        'data-module': 'hero',
        spacing: 'relaxed',
        width: 'wide',
      });
    });

    it('returns minimal props when only required fields provided', () => {
      const result = moduleProps({
        _type: 'text',
        _key: 'text-block',
      });

      expect(result).toEqual({
        id: 'module-text-block',
        'data-module': 'text',
      });
    });
  });

  describe('edge cases', () => {
    it('handles undefined _key', () => {
      const result = moduleProps({
        _type: 'banner',
        _key: undefined as unknown as string,
      });

      expect(result.id).toBe('module-undefined');
    });

    it('handles special characters in anchorId', () => {
      const result = moduleProps({
        _type: 'banner',
        _key: 'key',
        options: { anchorId: 'my-section#header' },
      });

      expect(result.id).toBe('my-section#header');
    });

    it('handles numeric _key', () => {
      const result = moduleProps({
        _type: 'banner',
        _key: '12345',
      });

      expect(result.id).toBe('module-12345');
    });
  });
});
