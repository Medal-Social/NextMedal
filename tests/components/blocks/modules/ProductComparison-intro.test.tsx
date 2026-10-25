import docs from '@tests/fixtures/lean-schema/documents.json';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

vi.mock('next-intl', () => ({ useLocale: () => 'en', useTranslations: () => (k: string) => k }));

import { blockDesign } from '@/components/blocks/modules/block-design';
import ProductComparison from '@/components/blocks/modules/content/ProductComparison';

/**
 * Comparison table: the lean Title + Text must render exactly what the stored
 * positional intro (h2 + paragraphs, ProductComparison.tsx) renders today.
 */
type Block = { _key: string; style?: string; children?: { text?: string }[] };
type Comparison = Sanity.ProductComparison & { intro: Block[] };

const STORED = (docs as unknown as { _id: string; modules?: Sanity.Module[] }[]).flatMap((doc) =>
  (doc.modules ?? [])
    .filter((m) => m._type === 'product-comparison')
    .map((m) => [doc._id, m as unknown as Comparison] as const)
);

/** What the lean-schema migration writes: first h2 → title, the rest → text. */
function lean({ intro, ...rest }: Comparison): Sanity.ProductComparison {
  const [heading, ...text] = intro;
  return {
    ...rest,
    title: heading?.children?.map((c) => c.text).join(''),
    text: text as Sanity.BlockContent,
  };
}

const html = (module: Sanity.ProductComparison) =>
  renderToStaticMarkup(<ProductComparison {...blockDesign(module)} />);

describe('comparison table intro', () => {
  it('covers every stored comparison table (h2 first)', () => {
    expect(STORED).toHaveLength(3);
    for (const [, m] of STORED) expect(m.intro[0]?.style).toBe('h2');
  });

  it.each(STORED)('%s renders the same from Title and Text', (_, stored) => {
    const before = html(stored);
    expect(before).toContain(stored.intro[0]?.children?.[0]?.text);
    expect(html(lean(stored))).toBe(before);
  });

  it('Home: "Why NextMedal Outperforms the Rest" with the paragraph under it', () => {
    const out = html({
      _type: 'product-comparison',
      _key: 'pc',
      title: 'Why NextMedal Outperforms the Rest',
      text: [
        {
          _type: 'block',
          _key: 'p',
          style: 'normal',
          markDefs: [],
          children: [{ _type: 'span', _key: 's', text: 'Discover…', marks: [] }],
        },
      ],
    } as Sanity.ProductComparison);
    expect(out).toMatch(/<h2[^>]*>Why NextMedal Outperforms the Rest<\/h2>/);
    expect(out).toContain('<p>Discover…</p>');
  });
});
