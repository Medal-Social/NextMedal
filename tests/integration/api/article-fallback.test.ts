import { describe, expect, it } from 'vitest';
import { getArticleFallbackImage } from '@/lib/utils/article-helpers';

describe('Article Fallback OG Image Integration', () => {
  describe('getArticleFallbackImage helper', () => {
    it('should generate correct URL for English articles', () => {
      const result = getArticleFallbackImage('Test Article', 'en');

      expect(result.src).toContain('/api/og/article-fallback');
      expect(result.src).toContain('title=Test+Article');
      expect(result.src).toContain('locale=en');
      expect(result.alt).toBe('Test Article');
      expect(result.width).toBe(1200);
      expect(result.height).toBe(630);
    });

    it('should generate correct URL for Norwegian articles', () => {
      const result = getArticleFallbackImage('Test Artikkel', 'nb');

      expect(result.src).toContain('/api/og/article-fallback');
      expect(result.src).toContain('title=Test+Artikkel');
      expect(result.src).toContain('locale=nb');
      expect(result.alt).toBe('Test Artikkel');
    });

    it('should generate correct URL for Arabic articles', () => {
      const result = getArticleFallbackImage('غوص عميق', 'ar');

      expect(result.src).toContain('/api/og/article-fallback');
      expect(result.src).toContain('locale=ar');
      expect(result.alt).toBe('غوص عميق');
    });

    it('should handle missing title', () => {
      const result = getArticleFallbackImage(undefined, 'en');

      expect(result.src).toContain('/api/og/article-fallback');
      expect(result.src).toContain('locale=en');
      expect(result.alt).toBe('');
    });

    it('should handle missing locale', () => {
      const result = getArticleFallbackImage('Test Article');

      expect(result.src).toContain('/api/og/article-fallback');
      expect(result.src).toContain('title=Test+Article');
      expect(result.alt).toBe('Test Article');
    });

    it('should truncate long titles to 100 characters', () => {
      const longTitle = 'a'.repeat(150);
      const result = getArticleFallbackImage(longTitle, 'en');

      // URL should contain truncated title
      const urlParams = new URLSearchParams(result.src.split('?')[1]);
      const titleParam = urlParams.get('title');
      expect(titleParam?.length).toBeLessThanOrEqual(100);
    });

    it('should encode special characters in title', () => {
      const result = getArticleFallbackImage('Title with & special <chars>', 'en');

      // Should properly encode special characters in the title parameter
      expect(result.src).toContain('Title+with');
      expect(result.src).toContain('%26'); // Encoded ampersand in title
      expect(result.src).toContain('%3C'); // Encoded < in title
      expect(result.src).toContain('%3E'); // Encoded > in title
      // URL should still have & between parameters (not encoded)
      expect(result.src).toMatch(/title=.*&locale=/);
    });
  });

  describe('URL parameter validation', () => {
    it('should include all required OG image dimensions', () => {
      const result = getArticleFallbackImage('Test', 'en');

      expect(result.width).toBe(1200);
      expect(result.height).toBe(630);
      // Standard OG image size
      expect(result.width / result.height).toBeCloseTo(1.905, 2);
    });

    it('should generate valid URLs', () => {
      const result = getArticleFallbackImage('Test Article', 'en');

      expect(() => new URL(result.src, 'http://localhost:3000')).not.toThrow();
    });
  });
});
