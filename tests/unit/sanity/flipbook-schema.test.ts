import { describe, expect, it } from 'vitest';
import flipbook from '@/sanity/schemaTypes/modules/content/flipbook';

describe('flipbook schema', () => {
  it('is a block with exactly two editor fields: PDF (required) and title', () => {
    expect(flipbook.name).toBe('flipbook');
    expect(flipbook.type).toBe('object');
    const fields = (
      flipbook as unknown as {
        fields: { name: string; type: string; options?: { accept?: string } }[];
      }
    ).fields;
    expect(fields.map((f) => f.name)).toEqual(['file', 'title']);
    expect(fields[0]?.type).toBe('file');
    expect(fields[0]?.options?.accept).toBe('application/pdf');
  });

  it('previews with the title, then the file name', () => {
    const prepare = (
      flipbook as unknown as {
        preview: { prepare: (v: Record<string, unknown>) => { title: string } };
      }
    ).preview.prepare;
    expect(prepare({ title: 'Report', filename: 'r.pdf' }).title).toBe('Report');
    expect(prepare({ filename: 'r.pdf' }).title).toBe('r.pdf');
    expect(prepare({}).title).toBe('Flipbook');
  });
});
