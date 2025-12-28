import { getLocale, getTranslations } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { getCurrentPage } from '@/lib/getCurrentPage';
import { getSite } from '@/sanity/lib/fetch';
import { CTAList } from '@/ui/cta';
import { CommandMenu } from '@/ui/utility/CommandMenu';
import HeaderClient from './Header.client';
import Logo from './Logo';
import Navigation from './navigation';

export default async function Header() {
  const [site, page, locale, localeSwitcherT, themeSelectorT] = await Promise.all([
    getSite(),
    getCurrentPage(),
    getLocale(),
    getTranslations('LocaleSwitcher'),
    getTranslations('ThemeSelector'),
  ]);
  const { title, logo, ctas, headerMenu, brandPage, enableSearch } = site;

  // Transform page data for language switcher
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
    locales[loc] = localeSwitcherT('locale', { locale: loc });
  }

  const localeLabels = {
    label: localeSwitcherT('label'),
    selectLanguage: localeSwitcherT('selectLanguage'),
    language: localeSwitcherT('language'),
    locales,
    translationNotAvailable: localeSwitcherT('translationNotAvailable', { locale: '{locale}' }),
    goToHome: localeSwitcherT('goToHome', { locale: '{locale}' }),
  };

  const themeLabels = {
    theme: themeSelectorT('theme'),
    light: themeSelectorT('light'),
    dark: themeSelectorT('dark'),
    system: themeSelectorT('system'),
  };

  const logoNode = <Logo title={title} logo={logo} brandPage={brandPage} />;

  return (
    <HeaderClient
      className="@container fixed top-0 w-full z-50"
      role="banner"
      aria-label="Site header"
      ctas={ctas ?? []}
      menu={{ items: headerMenu?.items }}
      enableSearch={enableSearch}
      serverPage={serverPage}
      locale={locale}
      localeLabels={localeLabels}
      themeLabels={themeLabels}
    >
      <div className="flex items-center">{logoNode}</div>

      <nav className="max-lg:hidden flex items-center" aria-label="Main navigation">
        <Navigation />
      </nav>

      <div className="flex items-center justify-end gap-4 ml-auto">
        {enableSearch && (
          <div className="hidden lg:block">
            <CommandMenu />
          </div>
        )}
        <CTAList ctas={ctas} />
      </div>
    </HeaderClient>
  );
}
