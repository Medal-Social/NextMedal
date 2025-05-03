import { cn } from '@/lib/utils';
import { getSite } from '@/sanity/lib/fetch';
import CTAList from '@/ui/CTAList';
import { Img } from '@/ui/Img';
import Link from 'next/link';
import ThemeToggleWrapper from './ThemeToggleWrapper';
import Toggle from './Toggle';
import Wrapper from './Wrapper';
import MobileNavigation from './mobile-navigation';
import Navigation from './navigation';
import type { MenuItem } from './navigation';

export default async function Header() {
  const { title, logo, ctas, headerMenu } = await getSite();

  const logoImageDark = logo?.image?.dark || logo?.image?.default || logo?.image?.light;
  const logoImageLight = logo?.image?.light || logo?.image?.default || logo?.image?.dark;

  return (
    <>
      <Wrapper
        className="bg-background max-lg:header-open:shadow-lg sticky top-0 z-50"
        role="banner"
        aria-label="Site header"
      >
        <div className="header-grid mx-auto grid max-w-screen-xl items-center gap-x-6 p-4">
          <div className="[grid-area:logo]">
            <Link
              className={cn('h4 lg:h3 inline-block', logo?.image && 'max-w-3xs')}
              href="/"
              aria-label={`Return to ${title} homepage`}
            >
              <>
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
              </>
            </Link>
          </div>

          <nav className="max-lg:hidden" aria-label="Main navigation">
            <Navigation />
          </nav>

          <div
            className="max-lg:hidden [grid-area:ctas] max-lg:*:w-full lg:ml-4"
            aria-label="Call to action buttons"
          >
            <CTAList ctas={ctas} />
          </div>

          <div
            className="flex items-center gap-2 ml-auto [grid-area:toggle-area]"
            aria-label="Theme and menu controls"
          >
            <div className="lg:block">
              <ThemeToggleWrapper />
            </div>
            <Toggle />
          </div>
        </div>
      </Wrapper>

      <div className="lg:hidden header-closed:hidden" aria-label="Mobile navigation menu">
        <MobileNavigation menu={{ items: headerMenu?.items }} ctas={ctas} />
      </div>
    </>
  );
}
