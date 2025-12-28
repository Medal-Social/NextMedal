import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Img, Source } from '@/ui/base';
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
          'h4 lg:h3 flex items-center gap-2 cursor-pointer',
          logo?.image && 'max-w-3xs'
        )}
        href="/"
        aria-label={`Return to ${title} homepage`}
      >
        {hasLogoImages ? (
          <picture>
            {/* Dark mode source - uses prefers-color-scheme media query */}
            {logoImageDark && !isSameImage && (
              <Source image={logoImageDark} media="(prefers-color-scheme: dark)" />
            )}
            {/* Light mode / default image */}
            {logoImageLight ? (
              <Img
                className="max-h-[1.2em] w-auto filter brightness-150 drop-shadow-md"
                image={logoImageLight}
                alt={`${logo?.name || title} logo`}
              />
            ) : logoImageDark ? (
              <Img
                className="max-h-[1.2em] w-auto filter brightness-150 drop-shadow-md"
                image={logoImageDark}
                alt={`${logo?.name || title} logo`}
              />
            ) : null}
          </picture>
        ) : (
          <span>{title}</span>
        )}
      </Link>
    </BrandMenu>
  );
}
