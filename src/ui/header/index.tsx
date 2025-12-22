import { getSite } from '@/sanity/lib/fetch';
import { CommandMenu } from '@/ui/CommandMenu';
import CTAList from '@/ui/CTAList';
import Logo from './Logo';
import MobileNavigation from './mobile-navigation';
import Navigation from './navigation';
import Toggle from './Toggle';
import Wrapper from './Wrapper';

export default async function Header() {
  const { title, logo, ctas, headerMenu, brandPage, enableSearch } = await getSite();

  const logoNode = <Logo title={title} logo={logo} brandPage={brandPage} />;

  return (
    <>
      <Wrapper
        className="@container fixed top-0 w-full z-50"
        role="banner"
        aria-label="Site header"
      >
        <div className="header-grid mx-auto grid max-w-7xl items-center gap-x-6 p-4 px-4 sm:px-6 lg:px-8">
          <div className="[grid-area:logo] flex items-center">{logoNode}</div>

          <nav
            className="max-lg:hidden [grid-area:nav] flex items-center"
            aria-label="Main navigation"
          >
            <Navigation />
          </nav>

          <div className="[grid-area:ctas] flex items-center justify-end gap-4 lg:ml-4">
            {enableSearch && (
              <div className="hidden lg:block">
                <CommandMenu />
              </div>
            )}
            <CTAList ctas={ctas} />
          </div>

          <div className="flex items-center gap-2 ml-auto [grid-area:toggle-area] lg:hidden">
            <Toggle />
          </div>
        </div>
      </Wrapper>

      <div className="lg:hidden header-closed:hidden">
        <MobileNavigation menu={{ items: headerMenu?.items }} ctas={ctas} headerLogo={logoNode} />
      </div>
    </>
  );
}
