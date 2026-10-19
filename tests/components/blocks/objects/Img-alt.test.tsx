import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { Img } from '@/components/blocks/objects/core/Img';

const sanityImage = {
  _type: 'image',
  asset: { _ref: 'image-Tb9Ew8CXIwaY6R1kjMvI0uRR-800x600-png', _type: 'reference' },
} as unknown as Sanity.Image;
const directImage = { src: 'https://example.com/a.png', width: 800, height: 600 } as never;

const altOf = (html: string) => html.match(/<img[^>]*?\salt="([^"]*)"/)?.[1];

describe.each([
  ['a Sanity image', sanityImage],
  ['a direct image', directImage],
])('Img alt text for %s', (_, image) => {
  it('keeps an empty alt when alt is passed as undefined', () => {
    const html = renderToStaticMarkup(<Img image={image} alt={undefined} />);
    expect(altOf(html)).toBe('');
  });

  it('uses the alt that is passed', () => {
    const html = renderToStaticMarkup(<Img image={image} alt="Two people at a laptop" />);
    expect(altOf(html)).toBe('Two people at a laptop');
  });

  it('falls back to the image alt', () => {
    const html = renderToStaticMarkup(
      <Img image={{ ...(image as object), alt: 'From the image' } as never} alt={undefined} />
    );
    expect(altOf(html)).toBe('From the image');
  });
});
