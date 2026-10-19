/**
 * The component gallery renders its blocks through blockDesign like the pages
 * do (video link, Title + Text), and its stored previews look the same.
 */
import docs from '@tests/fixtures/lean-schema/documents.json';
import { NextIntlClientProvider } from 'next-intl';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import messages from '@/messages/en.json';

const design = vi.hoisted(() => ({ off: false }));
vi.mock('@/components/blocks/modules/block-design', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/components/blocks/modules/block-design')>();
  return {
    ...actual,
    blockDesign: (module: Sanity.Module, page?: unknown) =>
      design.off ? module : actual.blockDesign(module, page as never),
  };
});
vi.mock('@/components/blocks/objects/core/Video', () => ({
  default: ({ data }: { data: { type: string; videoId?: string } }) => (
    <div data-testid="hero-video" data-type={data.type} data-video-id={data.videoId} />
  ),
}));
vi.mock('next/image', () => ({
  // biome-ignore lint/performance/noImgElement: test stub for next/image
  default: (props: { src: string; alt: string }) => <img src={props.src} alt={props.alt} />,
}));

import { GalleryModuleRenderer } from '@/components/blocks/modules/GalleryModuleRenderer';

const render = (module: Sanity.Module) =>
  renderToStaticMarkup(
    <NextIntlClientProvider locale="en" messages={messages}>
      <GalleryModuleRenderer module={module} />
    </NextIntlClientProvider>
  );

type Gallery = { _type: string; groups?: { items?: Sanity.Module[] }[] };
const ITEMS = (docs as unknown as { _id: string; modules?: Gallery[] }[])
  .flatMap((doc) => doc.modules ?? [])
  .filter((m) => m._type === 'component-gallery')
  .flatMap((m) => m.groups ?? [])
  .flatMap((g) => g.items ?? [])
  .map((item) => [`${item._type} ${item._key}`, item] as const);

describe('component gallery previews', () => {
  it('a page top with a video link plays the video', () => {
    const html = render({
      _type: 'hero',
      _key: 'g1',
      videoType: 'image',
      videoUrl: 'https://youtu.be/dQw4w9WgXcQ',
    } as Sanity.Hero);
    expect(html).toContain('data-video-id="dQw4w9WgXcQ"');
  });

  it('a comparison table shows its Title', () => {
    const html = render({
      _type: 'product-comparison',
      _key: 'g2',
      title: 'Compare plans',
    } as Sanity.ProductComparison);
    expect(html).toMatch(/<h2[^>]*>Compare plans<\/h2>/);
  });

  it('keeps module-<key> ids (no page anchors inside the gallery)', () => {
    const html = render({ _type: 'features', _key: 'g3' } as Sanity.Module);
    expect(html).toContain('id="module-g3"');
    expect(html).not.toContain('id="features"');
  });

  it('covers the stored gallery', () => {
    expect(ITEMS.length).toBeGreaterThan(5);
  });

  it.each(ITEMS)('%s looks the same as before', (_, item) => {
    design.off = true;
    const before = render(item);
    design.off = false;
    expect(render(item)).toBe(before);
  });
});
