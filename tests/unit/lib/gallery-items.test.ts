import docs from '@tests/fixtures/lean-schema/documents.json';
import { describe, expect, it } from 'vitest';
import { isRetiredGalleryModule } from '@/lib/sanity/gallery-items';
import { PAGE_BLOCK_NAMES } from '@/sanity/schemaTypes/page-blocks';

type Item = { _type: string };
type Doc = {
  _type: string;
  modules?: Array<{ _type: string; groups?: Array<{ items?: Item[] }> }>;
};

const STORED_ITEM_TYPES = new Set(
  (docs as unknown as Doc[])
    .filter((d) => d._type === 'page')
    .flatMap((d) => d.modules ?? [])
    .filter((m) => m._type === 'component-gallery')
    .flatMap((m) => m.groups ?? [])
    .flatMap((g) => g.items ?? [])
    .map((i) => i._type)
);

describe('retired gallery item types', () => {
  it('team is retired (the block is deleted; no empty tile before the migration)', () => {
    expect(STORED_ITEM_TYPES.has('team')).toBe(true);
    expect(isRetiredGalleryModule('team')).toBe(true);
  });

  it('every stored gallery item is a page block or retired', () => {
    const shown = [...STORED_ITEM_TYPES].filter((t) => !isRetiredGalleryModule(t));
    expect(shown.filter((t) => !PAGE_BLOCK_NAMES.includes(t))).toEqual([]);
  });
});
