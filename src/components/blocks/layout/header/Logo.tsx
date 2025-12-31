import Link from 'next/link';
import { Img, Source } from '@/components/blocks/objects/core';
import { cn } from '@/lib/utils/index';
import BrandMenu from './BrandMenu';
import type { LogoProps } from './types';

export default function Logo({ title, logo, brandPage }: LogoProps) {
  const logoImageDark = logo?.image?.dark || logo?.image?.default || logo?.image?.light;
  const logoImageLight = logo?.image?.light || logo?.image?.default || logo?.image?.dark;
  const hasLogoImages = logoImageDark || logoImageLight;

  // If both images are the same, just render one image
  const isSameImage = logoImageDark === logoImageLight;

  return (
    <BrandMenu logoData={logo} hasBrandPage={!!brandPage}>
      <Link
        className={cn(
          'flex items-center gap-2 cursor-pointer text-lg lg:text-xl font-semibold leading-none',
          logo?.image && 'max-w-3xs'
        )}
        href="/"
        aria-label={`Return to ${title} homepage`}
      >
        {hasLogoImages && (
          <picture className="flex items-center">
            {/* Dark mode source - uses prefers-color-scheme media query */}
            {logoImageDark && !isSameImage && (
              <Source image={logoImageDark} media="(prefers-color-scheme: dark)" />
            )}
            {/* Light mode / default image */}
            {logoImageLight ? (
              <Img
                className="h-8 lg:h-9 w-auto transition-transform duration-200 group-hover:scale-105"
                image={logoImageLight}
                alt={`${logo?.name || title} logo`}
              />
            ) : logoImageDark ? (
              <Img
                className="h-8 lg:h-9 w-auto transition-transform duration-200 group-hover:scale-105"
                image={logoImageDark}
                alt={`${logo?.name || title} logo`}
              />
            ) : null}
          </picture>
        )}
        <span className={cn('leading-none', hasLogoImages && 'hidden sm:block')}>{title}</span>
      </Link>
    </BrandMenu>
  );
}
