import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { isRetiredGalleryModule } from '@/lib/sanity/gallery-items';
import {
  COLLECTION_SHARE_IMAGES,
  MODULE_SHARE_IMAGES,
  ROUTE_SHARE_IMAGES,
  resolveShareImage,
  SHARE_IMAGE_FALLBACK_PATH,
  SHARE_IMAGE_HEIGHT,
  SHARE_IMAGE_WIDTH,
} from '@/lib/seo/share-images';

const BASE = 'https://example.com';

function imageFiles(): string[] {
  return [
    ...Object.values(ROUTE_SHARE_IMAGES),
    ...Object.values(MODULE_SHARE_IMAGES),
    ...Object.values(COLLECTION_SHARE_IMAGES),
  ].map((entry) => entry.file);
}

describe('designed share images', () => {
  it('commits a 1200×630 PNG for every mapped route and module', () => {
    const files = new Set(imageFiles());
    expect(files.size).toBeGreaterThan(0);
    for (const file of files) {
      expect(existsSync(resolve(process.cwd(), 'public/og', file))).toBe(true);
    }
  });

  it.each([
    ['index', '/og/home.png'],
    ['components', '/og/components.png'],
    ['docs', '/og/docs.png'],
    ['now', '/og/articles-frontpage.png'],
    ['articles', '/og/articles-frontpage.png'],
    ['changelog', '/og/changelog-frontpage.png'],
    ['events', '/og/events-frontpage.png'],
    ['newsletter', '/og/newsletter-frontpage.png'],
    ['quick-start', '/og/getting-started.png'],
    ['installation', '/og/getting-started.png'],
  ] as const)('maps /%s to %s with dimensions and alt', (slug, path) => {
    const image = resolveShareImage(
      {
        _type: 'page',
        metadata: { slug: { current: slug }, title: 'Ignored' },
        modules: [{ _type: 'hero' }],
      },
      BASE,
      'Ignored'
    );

    expect(image.url).toBe(`${BASE}${path}`);
    expect(image.width).toBe(SHARE_IMAGE_WIDTH);
    expect(image.height).toBe(SHARE_IMAGE_HEIGHT);
    expect(image.alt.length).toBeGreaterThan(10);
    expect(image.type).toBe('image/png');
    expect(image.url).not.toContain(SHARE_IMAGE_FALLBACK_PATH);
  });

  it('uses the leading module image when the page slug has no card of its own', () => {
    const image = resolveShareImage(
      {
        _type: 'page',
        metadata: { slug: { current: 'features' } },
        modules: [{ _type: 'richtext' }, { _type: 'features' }],
      },
      BASE,
      'Features'
    );

    expect(image.url).toBe(`${BASE}/og/richtext.png`);
  });

  it('skips an unknown leading module and uses the next designed card', () => {
    const image = resolveShareImage(
      {
        _type: 'page',
        metadata: { slug: { current: 'custom' } },
        modules: [{ _type: 'blog-frontpage' }, { _type: 'callout' }],
      },
      BASE,
      'Custom'
    );

    expect(image.url).toBe(`${BASE}/og/callout.png`);
  });

  it('uses the collection frontpage card for collection documents', () => {
    const image = resolveShareImage(
      {
        _type: 'collection.article',
        metadata: { slug: { current: 'deep-dive' } },
      },
      BASE,
      'Deep dive'
    );

    expect(image.url).toBe(`${BASE}/og/articles-frontpage.png`);
  });

  it('uses the getting-started card for a documentation quick-start article', () => {
    const image = resolveShareImage(
      {
        _type: 'collection.documentation',
        metadata: { slug: { current: 'quick-start' } },
      },
      BASE,
      'Quick start'
    );

    expect(image.url).toBe(`${BASE}/og/getting-started.png`);
  });

  it('uses docs.png for other documentation articles', () => {
    const image = resolveShareImage(
      {
        _type: 'collection.documentation',
        metadata: { slug: { current: 'project-structure' } },
      },
      BASE,
      'Project structure'
    );

    expect(image.url).toBe(`${BASE}/og/docs.png`);
  });

  it('prefers an uploaded image over the designed card', () => {
    const image = resolveShareImage(
      {
        _type: 'page',
        metadata: {
          slug: { current: 'index' },
          ogimage: 'https://cdn.example.com/custom.jpg',
        },
      },
      BASE,
      'Home title'
    );

    expect(image.url).toBe('https://cdn.example.com/custom.jpg');
    expect(image.width).toBe(1200);
    expect(image.height).toBe(630);
    expect(image.alt).toBe('Home title');
    expect(image.type).toBe('image/jpeg');
  });

  it('does not treat inherited object keys as routes', () => {
    const image = resolveShareImage(
      {
        _type: 'page',
        metadata: { slug: { current: 'constructor' } },
      },
      BASE,
      'Constructor'
    );

    expect(image.url).toBe(`${BASE}${SHARE_IMAGE_FALLBACK_PATH}`);
    expect(image.alt).toBe('Constructor');
  });

  it('uses the static fallback only when nothing matches', () => {
    const image = resolveShareImage(
      {
        _type: 'page',
        metadata: { slug: { current: 'unknown-page' } },
        modules: [{ _type: 'not-a-module' }],
      },
      BASE,
      'Unknown page'
    );

    expect(image.url).toBe(`${BASE}${SHARE_IMAGE_FALLBACK_PATH}`);
    expect(image.alt).toBe('Unknown page');
  });

  it('drops the retired blog-frontpage gallery item', () => {
    expect(isRetiredGalleryModule('blog-frontpage')).toBe(true);
    expect(isRetiredGalleryModule('blog-listing')).toBe(true);
    expect(isRetiredGalleryModule('hero')).toBe(false);
    expect(isRetiredGalleryModule('articles-frontpage')).toBe(false);
  });
});
