import { describe, expect, it, vi } from 'vitest';

vi.mock('next-sanity', () => ({ stegaClean: (v: unknown) => v }));

import {
  internalHref,
  internalLink,
  localizedTarget,
  withLocalePrefix,
} from '@/lib/sanity/localized-link';

const page = (slug: string, language: string, _id = `${slug}.${language}`) => ({
  _id,
  _type: 'page',
  language,
  metadata: { slug: { current: slug } },
});
const blog = {
  ...page('now', 'en'),
  translations: [page('now', 'en'), page('now', 'nb'), page('now', 'ar'), null],
};
const features = { ...page('features', 'en'), translations: [] };

describe('localizedTarget (spec D4)', () => {
  it('goes to the translation for the visitor language', () => {
    expect(localizedTarget(blog, 'nb')?.language).toBe('nb');
  });
  it('stays on the source document when there is no translation (on purpose)', () => {
    expect(localizedTarget(features, 'nb')).toBe(features);
  });
  it('keeps a target that is already in the visitor language', () => {
    expect(localizedTarget(page('now', 'nb'), 'nb')?.language).toBe('nb');
  });
});

describe('internalLink', () => {
  it('nb visitor, translated target: path without prefix + locale nb (Link adds /nb)', () => {
    expect(internalLink(blog, 'nb')).toEqual({ href: '/now', locale: 'nb' });
  });
  it('nb visitor, untranslated target: the English page, locale en', () => {
    expect(internalLink(features, 'nb')).toEqual({ href: '/features', locale: 'en' });
  });
  it('keeps the hash on Home', () => {
    expect(internalLink(page('index', 'en'), 'en', '#features')).toEqual({
      href: '/#features',
      locale: 'en',
    });
    expect(internalLink(page('index', 'nb'), 'nb', '#features')).toEqual({
      href: '/#features',
      locale: 'nb',
    });
  });
  it('returns undefined without a target', () => {
    expect(internalLink(undefined, 'nb')).toBeUndefined();
  });
});

describe('internalHref: the final href, with no prefix for English (no 308 via /en/...)', () => {
  it('nb visitor, untranslated target: /features, not /en/features', () => {
    expect(internalHref(features, 'nb')).toBe('/features');
  });
  it('nb visitor, translated target: /nb/now', () => {
    expect(internalHref(blog, 'nb')).toBe('/nb/now');
  });
  it('keeps the hash on Home', () => {
    expect(internalHref(page('index', 'en'), 'en', '#features')).toBe('/#features');
    expect(internalHref(page('index', 'nb'), 'nb', '#features')).toBe('/nb#features');
  });
  it('returns undefined without a target', () => {
    expect(internalHref(undefined, 'nb')).toBeUndefined();
  });
});

describe('withLocalePrefix', () => {
  it.each([
    ['/', 'en', '/'],
    ['/features', 'en', '/features'],
    ['/', 'nb', '/nb'],
    ['/now', 'nb', '/nb/now'],
    ['/#features', 'nb', '/nb#features'],
    ['/?q=1', 'ar', '/ar?q=1'],
  ])('%s in %s → %s', (href, locale, expected) => {
    expect(withLocalePrefix(href, locale)).toBe(expected);
  });
});
