import Link from 'next/link';
import { cn } from '@/lib/utils';
import { getSite } from '@/sanity/lib/fetch';
import { CommandMenu } from '@/ui/CommandMenu';
import CTAList from '@/ui/CTAList';
import { Img } from '@/ui/Img';
import BrandMenu from './BrandMenu';
import MobileNavigation from './mobile-navigation';
import Navigation from './navigation';
import Toggle from './Toggle';
import Wrapper from './Wrapper';

export default async function Header() {
  const { title, logo, ctas, headerMenu, brandPage, enableSearch } = await getSite();

  const logoImageDark = logo?.image?.dark || logo?.image?.default || logo?.image?.light;
  const logoImageLight = logo?.image?.light || logo?.image?.default || logo?.image?.dark;

  const logoNode = (
    <BrandMenu logoData={logo} hasBrandPage={!!brandPage}>
      <Link
        className={cn(
          'h4 lg:h3 flex items-center gap-2 cursor-pointer',
          logo?.image && 'max-w-3xs'
        )}
        href="/"
        aria-label={`Return to ${title} homepage`}
      >
        {logoImageDark ? (
          <Img
            className="hidden dark:inline-block max-h-[1.2em] w-auto filter brightness-150 drop-shadow-md"
            image={logoImageDark}
            alt={`${logo?.name || title} logo - dark version`}
          />
        ) : (
          <span className="hidden dark:inline-block">{title}</span>
        )}
        {logoImageLight ? (
          <Img
            className="inline-block dark:hidden max-h-[1.2em] w-auto filter brightness-150 drop-shadow-md"
            image={logoImageLight}
            alt={`${logo?.name || title} logo - light version`}
          />
        ) : (
          <span className="inline-block dark:hidden">{title}</span>
        )}
      </Link>
    </BrandMenu>
  );

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
