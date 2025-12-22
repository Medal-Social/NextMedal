import { getSite } from '@/sanity/lib/fetch';
import { CommandMenu } from '@/ui/CommandMenu';
import CTAList from '@/ui/CTAList';
import HeaderClient from './HeaderClient';
import Logo from './Logo';
import Navigation from './navigation';

export default async function Header() {
  const { title, logo, ctas, headerMenu, brandPage, enableSearch } = await getSite();

  const logoNode = <Logo title={title} logo={logo} brandPage={brandPage} />;

  return (
    <HeaderClient
      className="@container fixed top-0 w-full z-50"
      role="banner"
      aria-label="Site header"
      logo={logoNode}
      ctas={ctas}
      menu={{ items: headerMenu?.items }}
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
