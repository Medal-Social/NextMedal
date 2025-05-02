import { cn } from '@/lib/utils';
import { getSite } from '@/sanity/lib/fetch';
import { Img } from '@/ui/Img';
import Social from '@/ui/Social';
import { PortableText } from 'next-sanity';
import Link from 'next/link';
import Navigation from './Navigation';
import Wrapper from './wrapper';

export default async function Footer() {
  const { title, tagline, logo, copyright } = await getSite();

  const logoImageDark = logo?.image?.dark || logo?.image?.default || logo?.image?.light;
  const logoImageLight = logo?.image?.light || logo?.image?.default || logo?.image?.dark;

  return (
    <Wrapper className="bg-background text-foreground" role="contentinfo" aria-label="Site footer">
      <div className="section flex flex-wrap gap-x-12 gap-y-8 max-sm:flex-col">
        <div className="flex-1 min-w-[200px]">
          <Link
            className={cn('h3 md:h2 max-w-max', 'transition-colors hover:text-primary')}
            href="/"
            aria-label={`Return to ${title} homepage`}
          >
            <>
              {logoImageDark ? (
                <Img
                  className="hidden dark:inline-block max-h-[1.5em] w-auto"
                  image={logoImageDark}
                  alt={`${logo?.name || title} logo - dark version`}
                />
              ) : (
                <span className="hidden dark:inline-block">{title}</span>
              )}
              {logoImageLight ? (
                <Img
                  className="inline-block dark:hidden max-h-[1.5em] w-auto"
                  image={logoImageLight}
                  alt={`${logo?.name || title} logo - light version`}
                />
              ) : (
                <span className="inline-block dark:hidden">{title}</span>
              )}
            </>
          </Link>

          {tagline && (
            <div
              className="max-w-sm text-sm text-muted-foreground text-balance mt-3"
              aria-label="Site tagline"
            >
              <PortableText value={tagline} />
            </div>
          )}
        </div>

        <Navigation />
      </div>

      <div className="section flex flex-wrap justify-between items-center py-2">
        <div className="text-sm text-muted-foreground" aria-label="Copyright information">
          {copyright ? (
            <PortableText value={copyright} />
          ) : (
            <p>
              © {new Date().getFullYear()} {title}. All rights reserved.
            </p>
          )}
        </div>

        <Social className="mt-0" aria-label="Social media links" />
      </div>
    </Wrapper>
  );
}
