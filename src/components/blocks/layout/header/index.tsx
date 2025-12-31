import LocaleSwitcher from '@/components/blocks/layout/language-switcher';
import { CTAList } from '@/components/blocks/objects/cta';
import { getSite } from '@/sanity/lib/fetch';
import HeaderClient from './Header.client';
import Logo from './Logo';
import Navigation from './navigation';

export default async function Header() {
  const site = await getSite();
  const { title, logo, ctas, headerMenu, brandPage, enableSearch } = site;

  const logoNode = <Logo title={title} logo={logo} brandPage={brandPage} />;

  const navNode = (
    <nav className="max-lg:hidden flex items-center" aria-label="Main navigation">
      <Navigation headerMenu={headerMenu} />
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
      menu={{ items: headerMenu?.items }}
      enableSearch={enableSearch}
      logoNode={<div className="flex items-center">{logoNode}</div>}
      navNode={navNode}
      ctaNode={ctaNode}
      localeSwitcherNode={<LocaleSwitcher />}
    />
  );
}
