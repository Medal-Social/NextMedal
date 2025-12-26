'use client';

import { useLocale, useTranslations } from 'next-intl';
import { usePage } from '@/contexts/PageContext';
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

export interface LocaleSwitcherClientProps {
  className?: string;
  dropdownAlign?: 'start' | 'end' | 'center';
  serverPage?: ServerPageData;
}

export default function LocaleSwitcherClient({
  className,
  dropdownAlign,
  serverPage,
}: LocaleSwitcherClientProps) {
  const t = useTranslations('LocaleSwitcher');
  const locale = useLocale();
  const { page: contextPage } = usePage();

  // Use page from context if available, otherwise use server-provided page
  const page = contextPage || serverPage;

  // Build translation map: locale -> URL
  const translationUrls: Record<string, string> = {};

  // Helper to build locale-prefixed URL (default locale has no prefix)
  const buildUrl = (lang: string, slug: string, type: string) => {
    const isDefaultLocale = lang === routing.defaultLocale;
    const prefix = isDefaultLocale ? '' : `/${lang}`;
    if (slug === 'index') {
      return isDefaultLocale ? '/' : `/${lang}`;
    }
    if (type === 'blog.post') {
      return `${prefix}/blog/${slug}`;
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
      label={t('label')}
      selectLanguageLabel={t('selectLanguage')}
      languageText={t('language')}
      translationUrls={translationUrls}
      className={className}
      dropdownAlign={dropdownAlign}
    >
      {routing.locales.map((cur) => (
        <option key={cur} value={cur}>
          {t('locale', { locale: cur })}
        </option>
      ))}
    </LocaleSwitcherSelect>
  );
}
