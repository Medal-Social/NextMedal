import { useLocale, useTranslations } from 'next-intl';
import { routing } from '@/i18n/routing';
import LocaleSwitcherSelect from './LocaleSwitcherSelect';

interface LocaleSwitcherProps {
  page?: Sanity.PageBase;
}

export default function LocaleSwitcher({ page }: LocaleSwitcherProps = {}) {
  const t = useTranslations('LocaleSwitcher');
  const locale = useLocale();

  // Build translation map: locale -> URL
  const translationUrls: Record<string, string> = {};

  // Only build URLs if we have page data
  if (page) {
    const currentSlug = page.metadata?.slug?.current;
    const isIndex = currentSlug === 'index';
    const isBlogPost = page._type === 'blog.post';

    // Current page URL
    if (currentSlug) {
      if (isIndex) {
        translationUrls[locale] = locale === 'en' ? '/' : `/${locale}`;
      } else if (isBlogPost) {
        translationUrls[locale] = `/${locale}/blog/${currentSlug}`;
      } else {
        translationUrls[locale] = `/${locale}/${currentSlug}`;
      }
    }

    // Add translations
    if (page.translations) {
      for (const translation of page.translations) {
        const transSlug = translation.slug;
        const transLang = translation.language;
        const transType = translation._type;

        if (transSlug === 'index') {
          translationUrls[transLang] = transLang === 'en' ? '/' : `/${transLang}`;
        } else if (transType === 'blog.post') {
          translationUrls[transLang] = `/${transLang}/blog/${transSlug}`;
        } else {
          translationUrls[transLang] = `/${transLang}/${transSlug}`;
        }
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
    >
      {routing.locales.map((cur) => (
        <option key={cur} value={cur}>
          {t('locale', { locale: cur })}
        </option>
      ))}
    </LocaleSwitcherSelect>
  );
}
