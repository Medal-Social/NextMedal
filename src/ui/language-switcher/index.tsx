'use client';

import { useLocale, useTranslations } from 'next-intl';
import { usePage } from '@/contexts/PageContext';
import { routing } from '@/i18n/routing';
import LocaleSwitcherSelect from './LocaleSwitcherSelect';

export default function LocaleSwitcher({
  className,
  dropdownAlign,
}: {
  className?: string;
  dropdownAlign?: 'start' | 'end' | 'center';
}) {
  const t = useTranslations('LocaleSwitcher');
  const locale = useLocale();
  const { page } = usePage();

  // Build translation map: locale -> URL
  const translationUrls: Record<string, string> = {};

  // Helper to build locale-prefixed URL (English has no prefix)
  const buildUrl = (lang: string, slug: string, type: string) => {
    const prefix = lang === 'en' ? '' : `/${lang}`;
    if (slug === 'index') {
      return lang === 'en' ? '/' : `/${lang}`;
    }
    if (type === 'blog.post') {
      return `${prefix}/blog/${slug}`;
    }
    return `${prefix}/${slug}`;
  };

  // Only build URLs if we have page data
  if (page) {
    const currentSlug = page.metadata?.slug?.current;

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
