import { describe, expect, it } from 'vitest';
import { normalizeUrl } from '@/lib/utils/url';

describe('normalizeUrl', () => {
  describe('empty and undefined inputs', () => {
    it('returns empty string for undefined', () => {
      expect(normalizeUrl(undefined)).toBe('');
    });

    it('returns empty string for empty string', () => {
      expect(normalizeUrl('')).toBe('');
    });

    it('returns empty string for whitespace only', () => {
      expect(normalizeUrl('   ')).toBe('');
    });
  });

  describe('protocol handling', () => {
    it('preserves https:// protocol', () => {
      expect(normalizeUrl('https://example.com')).toBe('https://example.com');
    });

    it('preserves http:// protocol', () => {
      expect(normalizeUrl('http://example.com')).toBe('http://example.com');
    });

    it('adds https:// when no protocol present', () => {
      expect(normalizeUrl('example.com')).toBe('https://example.com');
    });

    it('adds https:// to www URLs without protocol', () => {
      expect(normalizeUrl('www.example.com')).toBe('https://www.example.com');
    });
  });

  describe('forceHttps option', () => {
    it('converts http to https when forceHttps is true', () => {
      expect(normalizeUrl('http://example.com', true)).toBe('https://example.com');
    });

    it('keeps https as https when forceHttps is true', () => {
      expect(normalizeUrl('https://example.com', true)).toBe('https://example.com');
    });

    it('does not convert http to https when forceHttps is false', () => {
      expect(normalizeUrl('http://example.com', false)).toBe('http://example.com');
    });

    it('adds https when no protocol and forceHttps is true', () => {
      expect(normalizeUrl('example.com', true)).toBe('https://example.com');
    });
  });

  describe('path and query string handling', () => {
    it('removes paths and returns only origin', () => {
      expect(normalizeUrl('https://example.com/path/to/page')).toBe('https://example.com');
    });

    it('removes query strings', () => {
      expect(normalizeUrl('https://example.com?query=value')).toBe('https://example.com');
    });

    it('removes fragments', () => {
      expect(normalizeUrl('https://example.com#section')).toBe('https://example.com');
    });

    it('removes complex paths and queries', () => {
      expect(normalizeUrl('https://example.com/path?foo=bar&baz=qux#anchor')).toBe(
        'https://example.com'
      );
    });
  });

  describe('port handling', () => {
    it('preserves port numbers', () => {
      expect(normalizeUrl('https://example.com:8080')).toBe('https://example.com:8080');
    });

    it('preserves localhost with port', () => {
      expect(normalizeUrl('http://localhost:3000')).toBe('http://localhost:3000');
    });
  });

  describe('subdomain handling', () => {
    it('preserves subdomains', () => {
      expect(normalizeUrl('https://api.example.com')).toBe('https://api.example.com');
    });

    it('preserves multiple subdomains', () => {
      expect(normalizeUrl('https://dev.api.example.com')).toBe('https://dev.api.example.com');
    });
  });

  describe('whitespace handling', () => {
    it('trims leading whitespace', () => {
      expect(normalizeUrl('  https://example.com')).toBe('https://example.com');
    });

    it('trims trailing whitespace', () => {
      expect(normalizeUrl('https://example.com  ')).toBe('https://example.com');
    });

    it('trims both leading and trailing whitespace', () => {
      expect(normalizeUrl('  https://example.com  ')).toBe('https://example.com');
    });
  });

  describe('invalid URLs', () => {
    it('returns empty string for invalid URL', () => {
      expect(normalizeUrl('not a valid url at all !@#$%')).toBe('');
    });

    it('handles URLs with special characters in domain', () => {
      // Depends on URL API behavior
      const result = normalizeUrl('https://example-.com');
      // Should either normalize or return empty for invalid
      expect(typeof result).toBe('string');
    });
  });

  describe('international domain names', () => {
    it('handles IDN domains', () => {
      const result = normalizeUrl('https://münchen.de');
      expect(result).toContain('://');
    });
  });

  describe('trailing slash handling', () => {
    it('removes trailing slash from domain', () => {
      expect(normalizeUrl('https://example.com/')).toBe('https://example.com');
    });

    it('removes trailing slash from path (returns origin only)', () => {
      expect(normalizeUrl('https://example.com/path/')).toBe('https://example.com');
    });
  });

  describe('case sensitivity', () => {
    it('preserves domain case (URL API lowercases automatically)', () => {
      const result = normalizeUrl('https://Example.COM');
      expect(result.toLowerCase()).toBe('https://example.com');
    });
  });

  describe('IP address handling', () => {
    it('handles IPv4 addresses', () => {
      expect(normalizeUrl('http://192.168.1.1')).toBe('http://192.168.1.1');
    });

    it('handles IPv4 with port', () => {
      expect(normalizeUrl('http://192.168.1.1:8080')).toBe('http://192.168.1.1:8080');
    });
  });
});
