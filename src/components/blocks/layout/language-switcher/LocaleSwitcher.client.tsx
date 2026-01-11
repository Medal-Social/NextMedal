'use client';

import { usePage } from '@/contexts';
import { routing } from '@/i18n/routing';
import { getCollectionSlugWithFallback } from '@/lib/collections/registry';
import { COLLECTION_TYPES, type CollectionType } from '@/lib/collections/types';
import LocaleSwitcherSelect from './LocaleSwitcherSelect';

export type Translation = {
  slug: string;
  language: string;
  _type: string;
};

export interface ServerPageData {
  _type: string;
  slug?: string;
  language?: string;
  translations?: Translation[];
}

export interface LocaleLabels {
  label: string;
  locales: Record<string, string>;
  translationNotAvailable: string;
  goToHome: string;
}

export interface LocaleSwitcherClientProps {
  className?: string;
  dropdownAlign?: 'start' | 'end' | 'center';
  serverPage?: ServerPageData;
  locale: string;
  labels: LocaleLabels;
}

/**
 * Helper to build locale-prefixed URL (default locale has no prefix)
 */
function buildUrl(lang: string, slug: string, _type: string): string {
  const isDefaultLocale = lang === routing.defaultLocale;
  const prefix = isDefaultLocale ? '' : `/${lang}`;
  if (slug === 'index') {
    return isDefaultLocale ? '/' : `/${lang}`;
  }
  if (COLLECTION_TYPES.includes(_type as CollectionType)) {
    const collectionSlug = getCollectionSlugWithFallback(_type as CollectionType, lang);
    return `${prefix}/${collectionSlug}/${slug}`;
  }
  return `${prefix}/${slug}`;
}

/**
 * Build translation URLs from current page and its translations
 */
function buildPageTranslationUrls(page: ServerPageData, locale: string): Record<string, string> {
  const urls: Record<string, string> = {};
  // biome-ignore lint/suspicious/noExplicitAny: ServerPageData has dynamic shape (metadata or slug)
  const currentSlug = 'metadata' in page ? (page as any).metadata?.slug?.current : page.slug;

  if (currentSlug) {
    urls[locale] = buildUrl(locale, currentSlug, page._type);
  }

  if (page.translations) {
    for (const translation of page.translations) {
      if (!translation?.language) continue;
      urls[translation.language] = buildUrl(
        translation.language,
        translation.slug,
        translation._type
      );
    }
  }

  return urls;
}

/**
 * Build fallback URLs for all locales pointing to home
 */
function buildFallbackUrls(): Record<string, string> {
  const urls: Record<string, string> = {};
  for (const loc of routing.locales) {
    const isDefaultLocale = loc === routing.defaultLocale;
    urls[loc] = isDefaultLocale ? '/' : `/${loc}`;
  }
  return urls;
}

export default function LocaleSwitcherClient({
  className,
  dropdownAlign,
  serverPage,
  locale,
  labels,
}: LocaleSwitcherClientProps) {
  const { page: contextPage } = usePage();
  const page = contextPage || serverPage;

  const translationUrls = page ? buildPageTranslationUrls(page, locale) : buildFallbackUrls();

  return (
    <LocaleSwitcherSelect
      defaultValue={locale}
      label={labels.label}
      translationUrls={translationUrls}
      className={className}
      dropdownAlign={dropdownAlign}
    >
      {routing.locales.map((cur) => (
        <option key={cur} value={cur}>
          {labels.locales[cur] || cur}
        </option>
      ))}
    </LocaleSwitcherSelect>
  );
}
