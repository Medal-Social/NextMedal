import { describe, expect, it } from 'vitest';
import callout from '@/sanity/schemaTypes/modules/marketing/callout';
import menuItem from '@/sanity/schemaTypes/objects/menu-item';

type Field = {
  name: string;
  title?: string;
  options?: { list?: Array<{ title: string; value: string }> };
  validation?: (rule: unknown) => unknown;
};
const item = menuItem as unknown as {
  title: string;
  fields: Field[];
  preview: {
    select: Record<string, string>;
    prepare: (v: Record<string, unknown>) => { title: string; subtitle: string };
  };
};
const field = (name: string) => item.fields.find((f) => f.name === name);

describe('link (menuItem) labels', () => {
  it('uses plain words', () => {
    expect(item.title).toBe('Link');
    expect(field('type')?.title).toBe('Link to');
    expect(field('type')?.options?.list?.map((o) => o.title)).toEqual([
      'Page on this site',
      'Other website',
    ]);
  });

  it('previews with the page name when the old page title is missing', () => {
    expect(item.preview.select.pageName).toBe('internal.metadata.title');
    const preview = item.preview.prepare({ pageName: 'Pricing', internal: 'pricing' });
    expect(preview).toMatchObject({ title: 'Pricing', subtitle: 'Page on this site → Pricing' });
    expect(item.preview.prepare({ external: 'https://x.com' }).subtitle).toBe(
      'Other website → https://x.com'
    );
  });
});

describe('message with buttons', () => {
  it('allows at most two buttons', () => {
    const ctas = (callout as unknown as { fields: Field[] }).fields.find((f) => f.name === 'ctas');
    let max: number | undefined;
    const rule = {
      max: (n: number) => {
        max = n;
        return rule;
      },
    };
    ctas?.validation?.(rule);
    expect(max).toBe(2);
  });
});
