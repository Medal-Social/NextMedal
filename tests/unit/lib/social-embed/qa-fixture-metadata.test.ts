import { describe, expect, it } from 'vitest';
import { SUPPORTED_LOCALES } from '@/i18n/config';
import {
  buildQaFixtureMetadata,
  qaFixtureBreadcrumbs,
} from '@/lib/social-embed/qa-fixture-metadata';

describe('buildQaFixtureMetadata', () => {
  it('gives every locale a distinct indexable title, description, image, and hreflang set', () => {
    const titles = new Set<string>();

    for (const locale of SUPPORTED_LOCALES) {
      const metadata = buildQaFixtureMetadata(locale, false);
      const title = String(metadata.title);
      const description = String(metadata.description);
      titles.add(title);

      expect(title.length).toBeGreaterThanOrEqual(50);
      expect(title.length).toBeLessThanOrEqual(60);
      expect(description.length).toBeGreaterThanOrEqual(70);
      expect(description.length).toBeLessThanOrEqual(160);

      expect(metadata.alternates?.canonical).toContain('/qa/social-embeds');
      const languages = metadata.alternates?.languages ?? {};
      for (const supported of SUPPORTED_LOCALES) {
        expect(languages[supported]).toContain('/qa/social-embeds');
      }
      expect(languages['x-default']).toBe(languages.en);

      const images = metadata.openGraph?.images;
      const image = Array.isArray(images) ? images[0] : images;
      expect(image).toMatchObject({ width: 1200, height: 630 });
      if (image && typeof image === 'object' && 'url' in image) {
        expect(String(image.url)).toContain('/api/og?title=');
      }
    }

    expect(titles.size).toBe(SUPPORTED_LOCALES.length);
  });

  it('keeps production noindex and without a canonical URL', () => {
    const metadata = buildQaFixtureMetadata('en', true);
    expect(metadata.robots).toMatchObject({ index: false, follow: false });
    expect(metadata.alternates?.canonical).toBeUndefined();
    expect(String(metadata.title).length).toBeGreaterThanOrEqual(50);
  });

  it('builds a locale breadcrumb path for structured data', () => {
    expect(qaFixtureBreadcrumbs('en').map((item) => item.path)).toEqual(['/', '/qa/social-embeds']);
    expect(qaFixtureBreadcrumbs('ar').map((item) => item.path)).toEqual([
      '/ar',
      '/ar/qa/social-embeds',
    ]);
  });
});
