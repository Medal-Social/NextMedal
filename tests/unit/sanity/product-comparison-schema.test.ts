import { describe, expect, it } from 'vitest';
import comparison from '@/sanity/schemaTypes/modules/content/product-comparison';

type Field = {
  name: string;
  title?: string;
  type: string;
  description?: string;
  hidden?: unknown;
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

  it('keeps the old positional intro hidden until the migration has run', () => {
    const intro = field('intro');
    expect(intro?.hidden).toBe(true);
    expect(intro?.deprecated?.reason).toBe('Moved to Title and Text by the lean-schema migration.');
  });

  it('shows Title and Text before the products', () => {
    const names = fields.map((f) => f.name);
    expect(names.indexOf('title')).toBeLessThan(names.indexOf('text'));
    expect(names.indexOf('text')).toBeLessThan(names.indexOf('products'));
  });
});
