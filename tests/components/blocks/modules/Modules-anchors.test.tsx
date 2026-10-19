import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/components/blocks/modules/ModuleRenderer', () => ({
  ModuleRenderer: ({ module }: { module: Sanity.Module }) => (
    <section
      id={module.options?.anchorId || `module-${module._key}`}
      data-module={module._type}
      data-bg={module.options?.bgTo}
      data-layout={(module as { layout?: string }).layout}
      data-rss={String((module as { showRssLink?: boolean }).showRssLink)}
      data-looks={(module as { ctas?: Array<{ style?: string }> }).ctas
        ?.map((cta) => cta.style)
        .join(',')}
    />
  ),
}));

import Modules from '@/components/blocks/modules/Modules';

const page = { _type: 'page', _id: 'p' } as unknown as Sanity.Page;

describe('Modules renders fixed anchors', () => {
  it('Features page: the text block is #text (header "Features" and the hero button link here)', () => {
    const html = renderToStaticMarkup(
      <Modules
        page={page}
        modules={
          [
            { _type: 'hero', _key: '04f625f95a96' },
            { _type: 'richtext', _key: 'decdb3fff7cb' },
          ] as Sanity.Module[]
        }
      />
    );
    expect(html).toContain('id="module-04f625f95a96"');
    expect(html).toContain('id="text"');
  });

  it('Home: the first feature grid is #features, even over a stale stored anchorId', () => {
    const html = renderToStaticMarkup(
      <Modules
        page={page}
        modules={
          [
            { _type: 'features', _key: '89cc2683f1c7', options: { anchorId: 'old' } },
          ] as Sanity.Module[]
        }
      />
    );
    expect(html).toContain('id="features"');
    expect(html).not.toContain('id="old"');
  });

  it('sidebar blocks keep their default module-<key> id', () => {
    const html = renderToStaticMarkup(
      <Modules
        page={page}
        isSidebar
        modules={[{ _type: 'callout', _key: 'side1' }] as Sanity.Module[]}
      />
    );
    expect(html).toContain('id="module-side1"');
    expect(html).not.toContain('id="message"');
  });

  it('a placement callout (no page) does not duplicate the page callout anchor', () => {
    const html = renderToStaticMarkup(
      <>
        <Modules modules={[{ _type: 'callout', _key: 'top1' }] as Sanity.Module[]} />
        <Modules page={page} modules={[{ _type: 'callout', _key: 'c1' }] as Sanity.Module[]} />
      </>
    );
    expect(html.match(/id="message"/g)).toHaveLength(1);
    expect(html).toContain('id="module-top1"');
  });
});

describe('Modules renders every block through blockDesign', () => {
  const hero = { _type: 'hero', _key: 'h1', options: { bgTo: 'brand-purple' } } as Sanity.Module;
  const at = (slug: string) =>
    ({
      _id: 'x',
      _type: 'page',
      language: 'nb',
      metadata: { slug: { current: slug } },
    }) as unknown as Sanity.Page;

  it('Home hero is navy, whatever the content stores', () => {
    const html = renderToStaticMarkup(<Modules modules={[hero]} page={at('index')} />);
    expect(html).toContain('data-bg="brand-navy"');
  });

  it('any other page top is purple', () => {
    const html = renderToStaticMarkup(
      <Modules modules={[{ ...hero, options: { bgTo: 'brand-navy' } }]} page={at('pricing')} />
    );
    expect(html).toContain('data-bg="brand-purple"');
  });

  it('a placement callout gets the button looks but no page anchor', () => {
    const callout = {
      _type: 'callout',
      _key: 'top1',
      ctas: [{ style: 'ghost' }, { style: 'primary' }],
    } as unknown as Sanity.Module;
    const html = renderToStaticMarkup(<Modules modules={[callout]} />);
    expect(html).toContain('data-looks="primary,ghost"');
    expect(html).toContain('id="module-top1"');
  });

  it('sidebar blocks get their button looks from code too (stored styles are migrated away)', () => {
    const callout = {
      _type: 'callout',
      _key: 'side1',
      ctas: [{ _key: 'a' }, { _key: 'b' }],
    } as unknown as Sanity.Module;
    const html = renderToStaticMarkup(
      <Modules modules={[callout]} page={at('pricing')} isSidebar />
    );
    expect(html).toContain('data-looks="primary,ghost"');
  });

  it('sidebar blocks get no page anchor (they sit beside the page)', () => {
    const features = { _type: 'features', _key: 'f1' } as Sanity.Module;
    const html = renderToStaticMarkup(
      <Modules modules={[features]} page={at('index')} isSidebar />
    );
    expect(html).toContain('id="module-f1"');
  });

  it('old and undesigned blocks pass through unchanged', () => {
    const video = { _type: 'videoHero', _key: 'v1', options: { bgTo: 'stored' } } as Sanity.Module;
    const html = renderToStaticMarkup(<Modules modules={[video]} page={at('index')} />);
    expect(html).toContain('data-bg="stored"');
  });
});

describe('placements are designed for the route language', () => {
  const newsletter = { _type: 'newsletter-frontpage', _key: 'n1' } as Sanity.Module;

  it('nb placement: list, no RSS link (RSS only in the default language)', () => {
    const html = renderToStaticMarkup(<Modules modules={[newsletter]} locale="nb" />);
    expect(html).toContain('data-layout="list"');
    expect(html).toContain('data-rss="false"');
    expect(html).toContain('id="module-n1"');
  });

  it('en placement: list with the RSS link', () => {
    const html = renderToStaticMarkup(<Modules modules={[newsletter]} locale="en" />);
    expect(html).toContain('data-layout="list"');
    expect(html).toContain('data-rss="true"');
  });
});
