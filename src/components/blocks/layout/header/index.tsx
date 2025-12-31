import { CTAList } from '@/components/blocks/objects/cta';
import { CommandMenu } from '@/components/blocks/utility/CommandMenu';
import { getSite } from '@/sanity/lib/fetch';
import HeaderClient from './Header.client';
import Logo from './Logo';
import Navigation from './navigation';

export default async function Header() {
  const site = await getSite();
  const { title, logo, ctas, headerMenu, brandPage, enableSearch } = site;

  const logoNode = <Logo title={title} logo={logo} brandPage={brandPage} />;

  return (
    <HeaderClient
      className="@container w-full"
      role="banner"
      aria-label="Site header"
      ctas={ctas ?? []}
      menu={{ items: headerMenu?.items }}
      enableSearch={enableSearch}
    >
      <div className="flex items-center">{logoNode}</div>

      <nav className="max-lg:hidden flex items-center" aria-label="Main navigation">
        <Navigation headerMenu={headerMenu} />
      </nav>

      <div className="hidden lg:flex items-center justify-end gap-4 ml-auto">
        {enableSearch && <CommandMenu />}
        <CTAList ctas={ctas} />
      </div>
    </HeaderClient>
  );
}
