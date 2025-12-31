import { describe, expect, it } from 'vitest';
import { GET } from '@/app/robots.txt/route';
import { RobotsResponseSchema } from './schemas/robots.schema';

/**
 * Contract tests for the robots.txt endpoint.
 * Validates response format for SEO crawlers.
 */
describe('Robots.txt API Contract', () => {
  describe('Response Schema Validation', () => {
    it('response matches robots.txt schema', async () => {
      const response = await GET();
      const text = await response.text();

      const result = RobotsResponseSchema.safeParse(text);

      if (!result.success) {
        console.error('Schema validation errors:', result.error.format());
      }

      expect(result.success).toBe(true);
    });

    it('returns text/plain content type', async () => {
      const response = await GET();

      expect(response.headers.get('Content-Type')).toBe('text/plain');
    });
  });

  describe('Required Directives', () => {
    it('contains User-agent directive', async () => {
      const response = await GET();
      const text = await response.text();

      expect(text).toContain('User-agent:');
    });

    it('contains Sitemap directive with valid URL', async () => {
      const response = await GET();
      const text = await response.text();

      expect(text).toContain('Sitemap:');
      // Sitemap URL should be absolute
      expect(text).toMatch(/Sitemap:\s*https?:\/\//);
    });

    it('contains Host directive', async () => {
      const response = await GET();
      const text = await response.text();

      expect(text).toContain('Host:');
    });
  });

  describe('Format Validation', () => {
    it('uses newline-separated directives', async () => {
      const response = await GET();
      const text = await response.text();
      const lines = text.split('\n');

      // Should have multiple lines
      expect(lines.length).toBeGreaterThan(5);
    });

    it('comments start with #', async () => {
      const response = await GET();
      const text = await response.text();
      const commentLines = text.split('\n').filter((line) => line.startsWith('#'));

      // Should have comment header (Medal Social branding)
      expect(commentLines.length).toBeGreaterThan(0);
    });
  });

  describe('Backward Compatibility', () => {
    it('contains standard robot directives', async () => {
      const response = await GET();
      const text = await response.text();

      // Must have at least User-agent and either Allow or Disallow
      expect(text).toContain('User-agent:');
      expect(text.includes('Allow:') || text.includes('Disallow:')).toBe(true);
    });
  });
});
