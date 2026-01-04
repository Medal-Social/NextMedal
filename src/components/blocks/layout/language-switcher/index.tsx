import { getLocale, getTranslations } from 'next-intl/server';
import { LOCALE_CONFIG } from '@/i18n/config';
import { routing } from '@/i18n/routing';
import { getCurrentPage } from '@/lib/sanity/get-current-page';
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

  // Build locale labels - AUTOMATIC from LOCALE_CONFIG!
  // Falls back to translation file for backwards compatibility
  const locales: Record<string, string> = {};
  for (const loc of routing.locales) {
    // First try to get from LOCALE_CONFIG (automatic)
    const config = LOCALE_CONFIG[loc as keyof typeof LOCALE_CONFIG];
    if (config) {
      locales[loc] = config.title;
    } else {
      // Fallback to translation file (manual)
      locales[loc] = t('locale', { locale: loc });
    }
  }

  const labels = {
    label: t('label'),
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
