import { describe, expect, it, vi } from 'vitest';

// Stand-in for Stega: invisible characters appended to strings in preview.
const MARK = '​‌';
vi.mock('next-sanity', () => ({
  stegaClean: (v: unknown) => (typeof v === 'string' ? v.replaceAll(MARK, '') : v),
}));

import { internalLink } from '@/lib/sanity/localized-link';

const encoded = (slug: string, language: string) => ({
  _id: `${slug}.${language}`,
  _type: 'page' as const,
  language: `${language}${MARK}`,
  metadata: { slug: { current: `${slug}${MARK}` } },
});

describe('internalLink with Stega-encoded preview values', () => {
  it('builds a clean href for a translated target', () => {
    const target = { ...encoded('now', 'en'), translations: [encoded('naa', 'nb')] };
    expect(internalLink(target, 'nb')).toEqual({ href: '/naa', locale: 'nb' });
  });
  it('builds a clean href for an English target', () => {
    expect(internalLink(encoded('features', 'en'), 'en')).toEqual({
      href: '/features',
      locale: 'en',
    });
  });
});
