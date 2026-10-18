import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/components/blocks/modules/ModuleRenderer', () => ({
  ModuleRenderer: ({ module }: { module: Sanity.Module }) => (
    <section id={module.options?.anchorId || `module-${module._key}`} data-module={module._type} />
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
