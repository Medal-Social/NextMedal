'use client';

import { usePage } from '@/contexts';
import { routing } from '@/i18n/routing';
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
  selectLanguage: string;
  language: string;
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

export default function LocaleSwitcherClient({
  className,
  dropdownAlign,
  serverPage,
  locale,
  labels,
}: LocaleSwitcherClientProps) {
  const { page: contextPage } = usePage();

  // Use page from context if available, otherwise use server-provided page
  const page = contextPage || serverPage;

  // Build translation map: locale -> URL
  const translationUrls: Record<string, string> = {};

  // Helper to build locale-prefixed URL (default locale has no prefix)
  const buildUrl = (lang: string, slug: string, _type: string) => {
    const isDefaultLocale = lang === routing.defaultLocale;
    const prefix = isDefaultLocale ? '' : `/${lang}`;
    if (slug === 'index') {
      return isDefaultLocale ? '/' : `/${lang}`;
    }
    return `${prefix}/${slug}`;
  };

  // Build URLs from page data
  if (page) {
    const currentSlug = 'metadata' in page ? page.metadata?.slug?.current : page.slug;

    // Current page URL
    if (currentSlug) {
      translationUrls[locale] = buildUrl(locale, currentSlug, page._type);
    }

    // Add translations
    if (page.translations) {
      for (const translation of page.translations) {
        // Skip null/undefined translations (can happen with deleted references)
        if (!translation?.language) continue;
        translationUrls[translation.language] = buildUrl(
          translation.language,
          translation.slug,
          translation._type
        );
      }
    }
  }

  return (
    <LocaleSwitcherSelect
      defaultValue={locale}
      label={labels.label}
      selectLanguageLabel={labels.selectLanguage}
      languageText={labels.language}
      translationUrls={translationUrls}
      className={className}
      dropdownAlign={dropdownAlign}
      translationNotAvailable={labels.translationNotAvailable}
      goToHome={labels.goToHome}
    >
      {routing.locales.map((cur) => (
        <option key={cur} value={cur}>
          {labels.locales[cur] || cur}
        </option>
      ))}
    </LocaleSwitcherSelect>
  );
}
