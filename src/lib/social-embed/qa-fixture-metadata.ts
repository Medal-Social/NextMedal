import type { Metadata } from 'next';
import { DEFAULT_LOCALE, SUPPORTED_LOCALES, type SupportedLocale } from '@/i18n/config';
import { BASE_URL } from '@/lib/core/env';
import { QA_SOCIAL_EMBEDS_PATH } from '@/lib/social-embed/qa-fixture-access';

/**
 * Per-locale titles are 50–60 characters with the primary keyword first.
 * Descriptions are 70–160 characters and end with a call to action.
 */
const COPY: Record<
  SupportedLocale,
  { title: string; description: string; breadcrumb: string; home: string }
> = {
  en: {
    title: 'Social embed cards for the Medal Social Lighthouse SEO gate',
    description:
      "Review Medal Social's server-rendered X, YouTube, and fallback social embed cards on this Lighthouse gate. Open a card to check the preview.",
    breadcrumb: 'Social embed cards',
    home: 'Home',
  },
  nb: {
    title: 'Sosiale innbyggingskort fra Medal Social, SEO-testen',
    description:
      'Se Medal Socials server-rendrede X-, YouTube- og reservekort på denne Lighthouse-testen. Åpne et kort og sjekk forhåndsvisningen.',
    breadcrumb: 'Sosiale innbyggingskort',
    home: 'Hjem',
  },
  ar: {
    title: 'بطاقات التضمين الاجتماعي من Medal Social لاختبار Lighthouse',
    description:
      'راجع بطاقات X وYouTube والاحتياط التي يعرضها خادم Medal Social على صفحة اختبار Lighthouse. افتح بطاقة لمعاينة المشاركة.',
    breadcrumb: 'بطاقات التضمين',
    home: 'الرئيسية',
  },
};

export function qaFixturePath(locale: string): string {
  const prefix = locale === DEFAULT_LOCALE ? '' : `/${locale}`;
  return `${prefix}${QA_SOCIAL_EMBEDS_PATH}`;
}

export function qaFixtureAbsoluteUrl(locale: string): string {
  return `${BASE_URL}${qaFixturePath(locale)}`;
}

function copyFor(locale: string) {
  if (locale in COPY) return COPY[locale as SupportedLocale];
  return COPY[DEFAULT_LOCALE];
}

/** Open Graph image from the site's 1200×630 card generator. */
export function qaFixtureOgImage(title: string): string {
  return `${BASE_URL}/api/og?title=${encodeURIComponent(title)}`;
}

export function qaFixtureLanguages(): Record<string, string> {
  const languages: Record<string, string> = {};
  for (const locale of SUPPORTED_LOCALES) {
    languages[locale] = qaFixtureAbsoluteUrl(locale);
  }
  languages['x-default'] = qaFixtureAbsoluteUrl(DEFAULT_LOCALE);
  return languages;
}

export function qaFixtureBreadcrumbs(locale: string): { name: string; path: string }[] {
  const copy = copyFor(locale);
  const homePath = locale === DEFAULT_LOCALE ? '/' : `/${locale}`;
  return [
    { name: copy.home, path: homePath },
    { name: copy.breadcrumb, path: qaFixturePath(locale) },
  ];
}

/**
 * Metadata for `/qa/social-embeds`.
 * Non-production is indexable (Lighthouse SEO). Production stays noindex with no canonical.
 */
export function buildQaFixtureMetadata(locale: string, production: boolean): Metadata {
  const copy = copyFor(locale);
  const absoluteUrl = qaFixtureAbsoluteUrl(locale);
  const image = {
    url: qaFixtureOgImage(copy.title),
    width: 1200,
    height: 630,
    alt: copy.title,
  };

  if (production) {
    return {
      title: copy.title,
      description: copy.description,
      robots: { index: false, follow: false },
      openGraph: {
        title: copy.title,
        description: copy.description,
        siteName: 'Medal Social',
        locale,
        type: 'article',
        images: [image],
      },
    };
  }

  return {
    title: copy.title,
    description: copy.description,
    alternates: {
      canonical: absoluteUrl,
      languages: qaFixtureLanguages(),
    },
    openGraph: {
      title: copy.title,
      description: copy.description,
      url: absoluteUrl,
      siteName: 'Medal Social',
      locale,
      type: 'article',
      images: [image],
    },
    twitter: { card: 'summary_large_image' },
  };
}
