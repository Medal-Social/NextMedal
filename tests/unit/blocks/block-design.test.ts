import { describe, expect, it } from 'vitest';
import {
  ARTICLE_LIST,
  blockDesign,
  DESIGNED_BLOCKS,
  type DesignPage,
  DOCS_LIST,
  EVENTS_LIST,
} from '@/components/blocks/modules/block-design';
import { PAGE_BLOCK_NAMES } from '@/sanity/schemaTypes/page-blocks';

const page = (
  slug: string,
  language = 'en',
  modules: Array<{ _type: string; _key: string }> = []
): DesignPage => ({
  _id: `${slug}.${language}`,
  _type: 'page',
  language,
  metadata: { slug: { current: slug } },
  modules,
});
const mod = (_type: string, extra: Record<string, unknown> = {}, _key = 'k') =>
  ({ _type, _key, ...extra }) as unknown as Sanity.Module & Record<string, unknown>;
const cta = (label: string, style?: string) =>
  ({
    _type: 'cta',
    _key: label,
    link: { _type: 'menuItem', label, type: 'external', external: '#x' },
    ...(style ? { style } : {}),
  }) as unknown as Sanity.CTA;
const design = (m: Sanity.Module, p: DesignPage = page('pricing')) =>
  blockDesign(m, p) as Sanity.Module & Record<string, any>;

describe('blockDesign covers exactly the page blocks', () => {
  it('designs the 14 blocks and nothing else', () => {
    expect([...DESIGNED_BLOCKS].sort()).toEqual([...PAGE_BLOCK_NAMES].sort());
    expect(PAGE_BLOCK_NAMES).toHaveLength(14);
  });
  it.each(['videoHero', 'component-gallery', 'lead-magnet'])(
    'passes %s through untouched',
    (type) => {
      const m = mod(type, { options: { anchorId: 'x' } });
      expect(blockDesign(m, page('index'))).toBe(m);
    }
  );
});

describe('page top (hero)', () => {
  it('is navy on every Home, purple elsewhere, whatever the content says', () => {
    for (const lang of ['en', 'nb', 'ar']) {
      expect(
        design(mod('hero', { options: { bgTo: 'brand-cyan' } }), page('index', lang)).options
      ).toEqual({
        bgFrom: 'brand-vibrant',
        bgTo: 'brand-navy',
      });
    }
    expect(design(mod('hero'), page('features')).options).toEqual({
      bgFrom: 'brand-vibrant',
      bgTo: 'brand-purple',
    });
  });
  it('first button solid, the others ghost', () => {
    expect(
      design(mod('hero', { ctas: [cta('a', 'ghost'), cta('b'), cta('c', 'primary')] })).ctas.map(
        (c: Sanity.CTA) => c.style
      )
    ).toEqual(['primary', 'ghost', 'ghost']);
  });
  it('shows a picture unless a video link is filled', () => {
    expect(design(mod('hero', { videoType: 'mux' })).videoType).toBe('image');
    expect(design(mod('hero', { videoUrl: 'https://youtu.be/dQw4w9WgXcQ' })).videoType).toBe(
      'youtube'
    );
  });
});

describe('message with buttons (callout)', () => {
  it('first button solid, the second ghost', () => {
    expect(
      design(mod('callout', { ctas: [cta('a'), cta('b', 'primary')] })).ctas.map(
        (c: Sanity.CTA) => c.style
      )
    ).toEqual(['primary', 'ghost']);
  });
});

describe('anchors', () => {
  it('come from the page (repeats numbered)', () => {
    const p = page('index', 'en', [
      { _type: 'features', _key: 'f1' },
      { _type: 'features', _key: 'f2' },
    ]);
    expect(design(mod('features', {}, 'f2'), p).options).toEqual({ anchorId: 'features-2' });
  });
  it('drop a stored anchor on blocks without one', () => {
    expect(
      design(mod('articles-frontpage', { options: { anchorId: 'x' } })).options
    ).toBeUndefined();
  });
});

describe('lists (what renders today, Vault plan C10)', () => {
  it('articles: same in every language', () => {
    expect(
      design(mod('articles-frontpage', { limit: 3, displayFilters: false }), page('now', 'nb'))
    ).toMatchObject(ARTICLE_LIST);
  });
  it('changelog and newsletter: RSS link only in the default language', () => {
    expect(design(mod('changelog-frontpage'), page('changelog', 'en')).showRssLink).toBe(true);
    expect(design(mod('changelog-frontpage'), page('endringslogg', 'nb')).showRssLink).toBe(false);
    expect(design(mod('newsletter-frontpage'), page('newsletter', 'ar')).showRssLink).toBe(false);
  });
  it('newsletter: list in the default language, grid in nb/ar (owner picks one later)', () => {
    expect(
      design(mod('newsletter-frontpage', { layout: 'grid' }), page('newsletter', 'en')).layout
    ).toBe('list');
    expect(design(mod('newsletter-frontpage'), page('nyhetsbrev', 'nb')).layout).toBe('grid');
    expect(
      design(mod('newsletter-frontpage', { layout: 'list' }), page('newsletter', 'ar')).layout
    ).toBe('grid');
  });
  it('events: cards, as /events renders today', () => {
    expect(
      design(mod('events-frontpage', { layout: 'calendar', limit: 12 }), page('events'))
    ).toMatchObject(EVENTS_LIST);
    expect(EVENTS_LIST.layout).toBe('cards');
  });
  it('docs: the component defaults, explicitly', () => {
    expect(design(mod('docs-frontpage', { showSearch: true }), page('docs'))).toMatchObject(
      DOCS_LIST
    );
  });
});

describe('comparison table', () => {
  it('turns Title + Text back into the intro the component renders', () => {
    const text = [
      {
        _type: 'block',
        _key: 't',
        style: 'normal',
        markDefs: [],
        children: [{ _type: 'span', _key: 's', text: 'Why.', marks: [] }],
      },
    ];
    const out = design(mod('product-comparison', { title: 'Compare', text }, 'pc'));
    expect(out.intro).toEqual([
      {
        _type: 'block',
        _key: 'pc-title',
        style: 'h2',
        markDefs: [],
        children: [{ _type: 'span', _key: 'pc-title-span', text: 'Compare', marks: [] }],
      },
      ...text,
    ]);
  });
  it('leaves an old intro alone during the dual-render window', () => {
    const intro = [{ _type: 'block', _key: 'i' }];
    expect(design(mod('product-comparison', { intro })).intro).toBe(intro);
  });
});
