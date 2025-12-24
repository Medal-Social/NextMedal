import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Img } from '@/ui/Img';
import BrandMenu from './BrandMenu';

interface LogoProps {
  title: string;
  logo: Sanity.Logo | undefined;
  brandPage: string | undefined;
}

export default function Logo({ title, logo, brandPage }: LogoProps) {
  const logoImageDark = logo?.image?.dark || logo?.image?.default || logo?.image?.light;
  const logoImageLight = logo?.image?.light || logo?.image?.default || logo?.image?.dark;

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
}
