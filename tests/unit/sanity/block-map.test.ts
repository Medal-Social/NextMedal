import docs from '@tests/fixtures/lean-schema/documents.json';
import { SPEC_BLOCK_MAP } from '@tests/fixtures/lean-schema/spec-block-map';
import { describe, expect, it } from 'vitest';

type Doc = { _id: string; _type: string; modules?: Array<{ _type: string }> };
const pages = (docs as Doc[]).filter((d) => d._type === 'page');
const count = (types: string[]) =>
  Object.fromEntries(
    [...new Set(types)].sort().map((t) => [t, types.filter((x) => x === t).length])
  );

describe('block map against the 2026-10-18 export', () => {
  const stored = pages.flatMap((p) => (p.modules ?? []).map((m) => m._type));

  it('has the module counts the plan was written against', () => {
    expect(count(stored)).toEqual({
      'accordion-list': 16,
      'articles-frontpage': 3,
      callout: 15,
      'changelog-frontpage': 4,
      'component-gallery': 1,
      'docs-frontpage': 4,
      'events-frontpage': 4,
      features: 4,
      hero: 10,
      'logo-cloud': 2,
      'newsletter-frontpage': 4,
      'pricing-list': 1,
      'product-comparison': 3,
      richtext: 4,
      videoHero: 1,
    });
  });

  it('maps every stored type', () => {
    expect([...new Set(stored)].filter((t) => !SPEC_BLOCK_MAP[t])).toEqual([]);
  });

  it('stores none of the blocks the spec deletes', () => {
    for (const t of [
      'team',
      'contact',
      'breadcrumbs',
      'latest-articles',
      'pricing-comparison',
      'lead-magnet',
    ]) {
      expect(stored).not.toContain(t);
    }
  });
});

describe('lean-schema fixtures are safe for a public repo', () => {
  it('hold no secrets, system documents or form submissions', () => {
    const leaked = (docs as Doc[])
      .filter((d) => /^(mux\.|sanity\.)|^lead$/.test(d._type))
      .map((d) => d._type);
    expect(leaked).toEqual([]);
  });
});
