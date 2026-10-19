import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/components/blocks/objects/core', () => ({
  Img: () => <span data-testid="hero-picture" />,
}));
vi.mock('@/components/blocks/objects/core/Video', () => ({
  default: ({ data }: { data: { type: string; videoId?: string } }) => (
    <div data-testid="hero-video" data-type={data.type} data-video-id={data.videoId} />
  ),
}));
vi.mock('@/components/blocks/objects/cta', () => ({ CTAList: () => null }));
vi.mock('@/components/blocks/modules/SharedPortableText', () => ({ default: () => null }));

import { blockDesign } from '@/components/blocks/modules/block-design';
import Hero from '@/components/blocks/modules/hero/Hero';

const picture = {
  image: { _type: 'image', asset: { _ref: 'image-abc-800x600-png', _type: 'reference' } },
} as unknown as Sanity.Img;

const render = (fields: Record<string, unknown>) =>
  renderToStaticMarkup(
    <Hero
      {...blockDesign({ _type: 'hero', _key: 'h', image: picture, ...fields } as Sanity.Hero)}
    />
  );

describe('page top shows a picture or a YouTube link', () => {
  it('a video link plays the YouTube video', () => {
    const html = render({ videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' });
    expect(html).toContain('data-testid="hero-video"');
    expect(html).toContain('data-type="youtube"');
    expect(html).toContain('data-video-id="dQw4w9WgXcQ"');
    expect(html).not.toContain('data-testid="hero-picture"');
  });

  it('no video link shows the picture (all 10 stored page tops)', () => {
    const html = render({ videoType: 'image' });
    expect(html).toContain('data-testid="hero-picture"');
    expect(html).not.toContain('data-testid="hero-video"');
  });

  it('a stale media type does not hide the video link', () => {
    const html = render({ videoType: 'image', videoUrl: 'https://youtu.be/dQw4w9WgXcQ' });
    expect(html).toContain('data-type="youtube"');
  });
});
