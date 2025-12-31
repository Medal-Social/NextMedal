import { describe, expect, it } from 'vitest';
import resolveSlug from '@/sanity/lib/resolveSlug';

describe('Menu Item Anchor Integration', () => {
  describe('URL generation from menu items', () => {
    it('should generate correct URL for internal link with anchor (with #)', () => {
      const menuItem = {
        label: 'Contact Section',
        type: 'internal' as const,
        internal: {
          _type: 'page',
          metadata: {
            slug: {
              current: 'about',
            },
          },
        },
        params: '#contact',
      };

      const url = resolveSlug({
        _type: menuItem.internal._type,
        internal: menuItem.internal.metadata.slug.current,
        params: menuItem.params,
      });

      expect(url).toBe('/about#contact');
    });

    it('should generate correct URL for internal link with anchor (without #)', () => {
      const menuItem = {
        label: 'Contact Section',
        type: 'internal' as const,
        internal: {
          _type: 'page',
          metadata: {
            slug: {
              current: 'about',
            },
          },
        },
        params: 'contact',
      };

      const url = resolveSlug({
        _type: menuItem.internal._type,
        internal: menuItem.internal.metadata.slug.current,
        params: menuItem.params,
      });

      expect(url).toBe('/about#contact');
    });

    it('should handle index page with anchor', () => {
      const menuItem = {
        label: 'Hero Section',
        type: 'internal' as const,
        internal: {
          _type: 'page',
          metadata: {
            slug: {
              current: 'index',
            },
          },
        },
        params: 'hero',
      };

      const url = resolveSlug({
        _type: menuItem.internal._type,
        internal: menuItem.internal.metadata.slug.current,
        params: menuItem.params,
      });

      expect(url).toBe('/#hero');
    });

    it('should work without anchor params', () => {
      const menuItem = {
        label: 'About Page',
        type: 'internal' as const,
        internal: {
          _type: 'page',
          metadata: {
            slug: {
              current: 'about',
            },
          },
        },
      };

      const url = resolveSlug({
        _type: menuItem.internal._type,
        internal: menuItem.internal.metadata.slug.current,
      });

      expect(url).toBe('/about');
    });

    it('should handle external URLs (params ignored)', () => {
      const menuItem = {
        label: 'External Link',
        type: 'external' as const,
        external: 'https://example.com',
        params: '#ignored',
      };

      const url = resolveSlug({
        external: menuItem.external,
        params: menuItem.params,
      });

      expect(url).toBe('https://example.com');
    });
  });

  describe('Anchor ID validation scenarios', () => {
    it('should accept valid alphanumeric anchor', () => {
      const isValid = /^[a-zA-Z0-9_-]+$/.test('contact123');
      expect(isValid).toBe(true);
    });

    it('should accept anchor with hyphens', () => {
      const isValid = /^[a-zA-Z0-9_-]+$/.test('contact-section');
      expect(isValid).toBe(true);
    });

    it('should accept anchor with underscores', () => {
      const isValid = /^[a-zA-Z0-9_-]+$/.test('contact_section');
      expect(isValid).toBe(true);
    });

    it('should reject anchor with spaces', () => {
      const isValid = /^[a-zA-Z0-9_-]+$/.test('contact section');
      expect(isValid).toBe(false);
    });

    it('should reject anchor with special characters', () => {
      const isValid = /^[a-zA-Z0-9_-]+$/.test('contact@section');
      expect(isValid).toBe(false);
    });

    it('should work with # prefix stripped', () => {
      const value = '#contact-section';
      const anchorContent = value.startsWith('#') ? value.slice(1) : value;
      const isValid = /^[a-zA-Z0-9_-]+$/.test(anchorContent);
      expect(isValid).toBe(true);
    });
  });

  describe('Real-world menu scenarios', () => {
    it('should handle navigation to pricing section on home page', () => {
      const url = resolveSlug({
        _type: 'page',
        internal: 'index',
        params: 'pricing',
      });

      expect(url).toBe('/#pricing');
    });

    it('should handle navigation to features section on about page', () => {
      const url = resolveSlug({
        _type: 'page',
        internal: 'about',
        params: '#features',
      });

      expect(url).toBe('/about#features');
    });

    it('should handle navigation to FAQ section on support page', () => {
      const url = resolveSlug({
        _type: 'page',
        internal: 'support/help',
        params: 'faq',
      });

      expect(url).toBe('/support/help#faq');
    });

    it('should handle multiple menu items with different anchors', () => {
      const menuItems = [
        { internal: 'index', params: 'hero' },
        { internal: 'index', params: '#features' },
        { internal: 'about', params: 'team' },
        { internal: 'about', params: '#contact' },
      ];

      const urls = menuItems.map((item) =>
        resolveSlug({
          _type: 'page',
          internal: item.internal,
          params: item.params,
        })
      );

      expect(urls).toEqual(['/#hero', '/#features', '/about#team', '/about#contact']);
    });
  });

  describe('Edge cases and error prevention', () => {
    it('should handle empty anchor gracefully', () => {
      const url = resolveSlug({
        _type: 'page',
        internal: 'about',
        params: '',
      });

      expect(url).toBe('/about');
    });

    it('should handle just # character (defensive)', () => {
      // Validation should prevent this, but resolveSlug handles it defensively
      const url = resolveSlug({
        _type: 'page',
        internal: 'about',
        params: '#',
      });

      // The function adds # if not present, but # is already there
      expect(url).toBe('/about#');
    });

    it('should not double-add # for already valid anchors', () => {
      const anchors = ['#contact', '#pricing', '#faq'];

      const urls = anchors.map((params) =>
        resolveSlug({
          _type: 'page',
          internal: 'about',
          params,
        })
      );

      expect(urls).toEqual(['/about#contact', '/about#pricing', '/about#faq']);
    });

    it('should ensure # is added for anchors without it', () => {
      const anchors = ['contact', 'pricing', 'faq'];

      const urls = anchors.map((params) =>
        resolveSlug({
          _type: 'page',
          internal: 'about',
          params,
        })
      );

      expect(urls).toEqual(['/about#contact', '/about#pricing', '/about#faq']);
    });
  });
});
