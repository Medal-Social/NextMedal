import type { NextRequest } from 'next/server';
import { describe, expect, it } from 'vitest';
import { GET as getSitemapIndex } from '@/app/sitemap.xml/route';
import { SitemapIndexResponseSchema } from './schemas/sitemap.schema';

/**
 * Contract tests for the sitemap endpoints.
 * Validates XML format for search engine crawlers.
 */
describe('Sitemap API Contract', () => {
  describe('Sitemap Index', () => {
    describe('Response Schema Validation', () => {
      it('response matches sitemap index schema', async () => {
        const mockRequest = new Request('http://localhost:3000/sitemap.xml');
        const response = await getSitemapIndex(mockRequest as unknown as NextRequest);
        const xml = await response.text();

        const result = SitemapIndexResponseSchema.safeParse(xml);

        expect(result.success).toBe(true);
      });

      it('returns application/xml content type', async () => {
        const mockRequest = new Request('http://localhost:3000/sitemap.xml');
        const response = await getSitemapIndex(mockRequest as unknown as NextRequest);

        expect(response.headers.get('Content-Type')).toContain('application/xml');
      });

      it('has caching headers', async () => {
        const mockRequest = new Request('http://localhost:3000/sitemap.xml');
        const response = await getSitemapIndex(mockRequest as unknown as NextRequest);

        expect(response.headers.get('Cache-Control')).toContain('public');
      });
    });

    describe('XML Structure', () => {
      it('has XML declaration', async () => {
        const mockRequest = new Request('http://localhost:3000/sitemap.xml');
        const response = await getSitemapIndex(mockRequest as unknown as NextRequest);
        const xml = await response.text();

        expect(xml).toMatch(/^<\?xml version="1\.0"/);
      });

      it('has XSL stylesheet reference', async () => {
        const mockRequest = new Request('http://localhost:3000/sitemap.xml');
        const response = await getSitemapIndex(mockRequest as unknown as NextRequest);
        const xml = await response.text();

        expect(xml).toContain('<?xml-stylesheet');
        expect(xml).toContain('sitemap-index.xsl');
      });

      it('uses sitemap.org namespace', async () => {
        const mockRequest = new Request('http://localhost:3000/sitemap.xml');
        const response = await getSitemapIndex(mockRequest as unknown as NextRequest);
        const xml = await response.text();

        expect(xml).toContain('xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"');
      });

      it('contains sitemap entries for locales', async () => {
        const mockRequest = new Request('http://localhost:3000/sitemap.xml');
        const response = await getSitemapIndex(mockRequest as unknown as NextRequest);
        const xml = await response.text();

        // Should have entries for at least English and Norwegian
        expect(xml).toContain('<sitemap>');
        expect(xml).toContain('<loc>');
        expect(xml).toContain('<lastmod>');
      });
    });

    describe('Backward Compatibility', () => {
      it('sitemap entries have required elements', async () => {
        const mockRequest = new Request('http://localhost:3000/sitemap.xml');
        const response = await getSitemapIndex(mockRequest as unknown as NextRequest);
        const xml = await response.text();

        // Each sitemap entry must have loc and lastmod
        const sitemapCount = (xml.match(/<sitemap>/g) || []).length;
        const locCount = (xml.match(/<loc>/g) || []).length;
        const lastmodCount = (xml.match(/<lastmod>/g) || []).length;

        expect(locCount).toBe(sitemapCount);
        expect(lastmodCount).toBe(sitemapCount);
      });

      it('loc URLs are absolute', async () => {
        const mockRequest = new Request('http://localhost:3000/sitemap.xml');
        const response = await getSitemapIndex(mockRequest as unknown as NextRequest);
        const xml = await response.text();

        // All loc elements should contain absolute URLs
        expect(xml).toMatch(/<loc>https?:\/\//);
      });
    });
  });
});
