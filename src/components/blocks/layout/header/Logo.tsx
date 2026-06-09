'use client';

import { usePathname } from 'next/navigation';
import { Img, Source } from '@/components/blocks/objects/core';
import { DEFAULT_LOCALE } from '@/i18n/config';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/utils/index';
import BrandMenu from './BrandMenu';
import type { LogoProps } from './types';

export default function Logo({ title, logo, brandPage, locale }: LogoProps) {
  const pathname = usePathname();
  const logoImageDark = logo?.image?.dark || logo?.image?.default || logo?.image?.light;
  const logoImageLight = logo?.image?.light || logo?.image?.default || logo?.image?.dark;
  const hasLogoImages = logoImageDark || logoImageLight;

  // If both images are the same, just render one image
  const isSameImage = logoImageDark === logoImageLight;

  // The i18n <Link> prepends the active locale automatically, so the href is
  // the unprefixed home path. usePathname() (next/navigation) returns the
  // localized path, so compare against the locale-prefixed home below.
  const localizedHome = locale === DEFAULT_LOCALE ? '/' : `/${locale}`;

  // Scroll to top when clicking logo while already on homepage
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (pathname === localizedHome) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <BrandMenu logoData={logo} hasBrandPage={!!brandPage}>
      <Link
        className={cn(
          'flex cursor-pointer items-center gap-2 font-semibold text-lg leading-none lg:text-xl',
          logo?.image && 'max-w-3xs'
        )}
        href="/"
        onClick={handleClick}
        aria-label={`Return to ${title} homepage`}
      >
        {hasLogoImages && (
          <picture className="flex items-center">
            {/* Dark mode source - uses prefers-color-scheme media query */}
            {logoImageDark && !isSameImage && (
              <Source image={logoImageDark} media="(prefers-color-scheme: dark)" />
            )}
            {/* Light mode / default image */}
            {(() => {
              const fallbackImage = logoImageLight ?? logoImageDark;
              if (!fallbackImage) return null;
              return (
                <Img
                  className="h-8 w-auto transition-transform duration-200 group-hover:scale-105 lg:h-9"
                  image={fallbackImage}
                  alt={`${logo?.name || title} logo`}
                />
              );
            })()}
          </picture>
        )}
        <span className={cn('leading-none', hasLogoImages && 'hidden sm:block')}>{title}</span>
      </Link>
    </BrandMenu>
  );
}
