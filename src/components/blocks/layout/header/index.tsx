import { getLocale } from 'next-intl/server';
import LocaleSwitcher from '@/components/blocks/layout/language-switcher';
import { CTAList } from '@/components/blocks/objects/cta';
import { getHeaderSettings } from '@/sanity/lib/fetch';
import { ErrorBoundary } from '../ErrorBoundary';
import HeaderClient from './Header.client';
import { HeaderFallback } from './HeaderFallback';
import Logo from './Logo';
import Navigation from './navigation';

async function HeaderInner() {
  const locale = await getLocale();
  const site = await getHeaderSettings(locale);

  // If no site settings, return fallback (build-time and runtime safe)
  if (!site) {
    return <HeaderFallback />;
  }

  // biome-ignore lint/suspicious/noExplicitAny: title and other fields are flattened by GROQ but not by generated types
  const { title, logo, ctas, headerNav, brandPage, enableSearch } = site as any;

  const logoNode = <Logo title={title} logo={logo} brandPage={brandPage} locale={locale} />;

  const navNode = (
    <nav className="max-lg:hidden flex items-center" aria-label="Main navigation">
      <Navigation items={headerNav} />
    </nav>
  );

  const ctaNode = (
    <div className="hidden lg:flex items-center gap-4">
      <CTAList ctas={ctas} />
    </div>
  );

  return (
    <HeaderClient
      className="@container w-full"
      role="banner"
      aria-label="Site header"
      ctas={ctas ?? []}
      menu={{ items: headerNav }}
      enableSearch={enableSearch}
      logoNode={<div className="flex items-center">{logoNode}</div>}
      navNode={navNode}
      ctaNode={ctaNode}
      localeSwitcherNode={<LocaleSwitcher />}
    />
  );
}

export default function Header() {
  return (
    <ErrorBoundary fallback={<HeaderFallback />} componentName="Header">
      <HeaderInner />
    </ErrorBoundary>
  );
}
