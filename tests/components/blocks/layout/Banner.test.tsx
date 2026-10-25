import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';

const intl = vi.hoisted(() => ({ locale: 'en' }));
vi.mock('next-intl', () => ({ useLocale: () => intl.locale }));
afterEach(() => {
  intl.locale = 'en';
});

import BannerClient, { bannerBlocks } from '@/components/blocks/layout/banner/Banner.client';

const block = (key: string, text: string) => ({
  _type: 'block',
  _key: key,
  style: 'normal',
  markDefs: [],
  children: [{ _type: 'span', _key: `${key}-s`, text, marks: [] }],
});
const value = (lang: string, text: string, legacy = false) => ({
  _type: 'internationalizedArrayBlockContentValue',
  _key: legacy ? lang : `k-${lang}`,
  ...(legacy ? {} : { language: lang }),
  value: [block(`b-${lang}`, text)],
});

const banner = (content: unknown[]) =>
  ({ _id: 'b', _type: 'banner', _key: 'b', content }) as unknown as Sanity.Banner & Sanity.Module;

describe('banner content', () => {
  it('renders stored plain blocks (every banner on prod today)', () => {
    const html = renderToStaticMarkup(
      <BannerClient banner={banner([block('p1', 'NextMedal is currently in beta')])} />
    );
    expect(html).toContain('NextMedal is currently in beta');
  });

  it('renders the visitor language of a translated banner', () => {
    intl.locale = 'nb';
    const html = renderToStaticMarkup(
      <BannerClient banner={banner([value('en', 'In beta'), value('nb', 'I beta')])} />
    );
    expect(html).toContain('I beta');
    expect(html).not.toContain('In beta');
  });

  it('picks by language, then legacy _key, then en, then the first value', () => {
    expect(bannerBlocks([value('en', 'en'), value('ar', 'ar', true)] as never, 'ar')).toEqual(
      value('ar', 'ar', true).value
    );
    expect(bannerBlocks([value('ar', 'ar'), value('en', 'en')] as never, 'nb')).toEqual(
      value('en', 'en').value
    );
    expect(bannerBlocks([value('ar', 'ar')] as never, 'nb')).toEqual(value('ar', 'ar').value);
  });

  it('a half-converted draft (plain blocks + empty value) keeps the plain blocks', () => {
    const plain = block('p1', 'beta');
    const empty = { _type: 'internationalizedArrayBlockContentValue', _key: 'en' };
    expect(bannerBlocks([plain, empty] as never, 'en')).toEqual([plain]);
  });
});
