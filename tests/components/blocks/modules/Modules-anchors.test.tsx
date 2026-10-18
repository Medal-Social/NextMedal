import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/components/blocks/modules/ModuleRenderer', () => ({
  ModuleRenderer: ({ module }: { module: Sanity.Module }) => (
    <section id={module.options?.anchorId || `module-${module._key}`} data-module={module._type} />
  ),
}));

import Modules from '@/components/blocks/modules/Modules';

describe('Modules renders fixed anchors', () => {
  it('Features page: the text block is #text (header "Features" and the hero button link here)', () => {
    const html = renderToStaticMarkup(
      <Modules
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

  it('Home: the first feature grid is #features', () => {
    const html = renderToStaticMarkup(
      <Modules
        modules={
          [
            { _type: 'features', _key: '89cc2683f1c7', options: { anchorId: undefined } },
          ] as Sanity.Module[]
        }
      />
    );
    expect(html).toContain('id="features"');
  });
});
