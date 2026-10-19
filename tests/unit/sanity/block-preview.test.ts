import { describe, expect, it } from 'vitest';
import { blockPreview, previewText } from '@/sanity/schemaTypes/modules/preview';

describe('block list previews', () => {
  it('shows the title text with line breaks as spaces (spec §1 rule 4)', () => {
    expect(previewText('A Brand is a\nPromise')).toBe('A Brand is a Promise');
    expect(previewText(['Identity first.', 'Clarity always.'])).toBe(
      'Identity first. · Clarity always.'
    );
    expect(
      previewText([
        { _type: 'block', children: [{ _type: 'span', text: 'one' }] },
        { _type: 'block', children: [{ _type: 'span', text: 'two' }] },
      ])
    ).toBe('one two');
  });

  it('names the block and falls back to its name', () => {
    const preview = blockPreview('Page top', {
      title: 'headline',
      italic: 'headlineItalic',
      media: 'image',
    });
    expect(preview.select).toEqual({ title: 'headline', italic: 'headlineItalic', media: 'image' });
    expect(preview.prepare({ title: 'Let’s start', italic: 'a conversation.' })).toEqual({
      title: 'Let’s start a conversation.',
      subtitle: 'Page top',
      media: undefined,
    });
    expect(preview.prepare({ fallback: 'The Magic Cube' })).toMatchObject({
      title: 'The Magic Cube',
    });
    expect(preview.prepare({ title: 'Own title', fallback: 'The Magic Cube' })).toMatchObject({
      title: 'Own title',
    });
    expect(preview.prepare({})).toMatchObject({ title: 'Page top', subtitle: 'Page top' });
  });
});
