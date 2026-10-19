import { describe, expect, it } from 'vitest';
import comparison from '@/sanity/schemaTypes/modules/content/product-comparison';

type Field = {
  name: string;
  title?: string;
  type: string;
  description?: string;
  hidden?: unknown;
  readOnly?: unknown;
  deprecated?: { reason: string };
  of?: { type: string; styles?: { value: string }[] }[];
};
const fields = (comparison as unknown as { fields: Field[] }).fields;
const field = (name: string) => fields.find((f) => f.name === name);

describe('comparison table schema', () => {
  it('has a Title and a plain Text', () => {
    expect(field('title')).toMatchObject({ title: 'Title', type: 'string' });
    const text = field('text');
    expect(text).toMatchObject({
      title: 'Text',
      type: 'array',
      description: 'Shown under the title.',
    });
    expect(text?.of?.[0]?.styles?.map((s) => s.value)).toEqual(['normal']);
  });

  it('shows the old positional intro read-only, and only while it has content', () => {
    const intro = field('intro');
    const hidden = intro?.hidden as (ctx: { value?: unknown }) => boolean;
    expect(hidden({ value: undefined })).toBe(true);
    expect(hidden({ value: [{ _type: 'block', _key: 'b' }] })).toBe(false);
    expect(intro?.readOnly).toBe(true);
    expect(intro?.description).toBe('Old intro — move it into Title and Text.');
    expect(intro?.deprecated?.reason).toBe('Moved to Title and Text by the lean-schema migration.');
  });

  it('shows Title and Text before the products', () => {
    const names = fields.map((f) => f.name);
    expect(names.indexOf('title')).toBeLessThan(names.indexOf('text'));
    expect(names.indexOf('text')).toBeLessThan(names.indexOf('products'));
  });
});
