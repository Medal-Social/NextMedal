import { getLocale, getTranslations } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { getCurrentPage } from '@/lib/getCurrentPage';
import LocaleSwitcherClient from './LocaleSwitcher.client';

interface LocaleSwitcherProps {
  className?: string;
  dropdownAlign?: 'start' | 'end' | 'center';
}

export default async function LocaleSwitcher({ className, dropdownAlign }: LocaleSwitcherProps) {
  // Fetch page, locale, and translations in parallel
  const [page, locale, t] = await Promise.all([
    getCurrentPage(),
    getLocale(),
    getTranslations('LocaleSwitcher'),
  ]);

  // Transform to the shape expected by the client component
  const serverPage = page
    ? {
        _type: page._type,
        slug: page.metadata?.slug?.current,
        language: page.language,
        translations: page.translations,
      }
    : undefined;

  // Build locale labels
  const locales: Record<string, string> = {};
  for (const loc of routing.locales) {
    locales[loc] = t('locale', { locale: loc });
  }

  const labels = {
    label: t('label'),
    selectLanguage: t('selectLanguage'),
    language: t('language'),
    locales,
    translationNotAvailable: t('translationNotAvailable', { locale: '{locale}' }),
    goToHome: t('goToHome', { locale: '{locale}' }),
  };

  return (
    <LocaleSwitcherClient
      className={className}
      dropdownAlign={dropdownAlign}
      serverPage={serverPage}
      locale={locale}
      labels={labels}
    />
  );
}
