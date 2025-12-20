import Link from 'next/link';
import { PortableText } from 'next-sanity';
import { Section } from '@/components/ui/section';
import resolveUrl from '@/lib/resolveUrl';
import { cn } from '@/lib/utils';
import { getSite } from '@/sanity/lib/fetch';
import { Img } from '@/ui/Img';
import Social from '@/ui/Social';
import Navigation from './Navigation';
import SystemStatus from './SystemStatus';

export default async function Footer() {
  const { title, tagline, logo, copyright, footerLinks, systemStatus } = await getSite();

  const logoImageDark = logo?.image?.dark || logo?.image?.default || logo?.image?.light;
  const logoImageLight = logo?.image?.light || logo?.image?.default || logo?.image?.dark;

  return (
    <footer className="bg-background text-foreground">
      <Section className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] gap-x-12 gap-y-8 pb-12">
        <div className="flex flex-col gap-6">
          <Link
            className={cn('h3 md:h2 max-w-max', 'transition-colors hover:text-primary')}
            href="/"
            aria-label={`Return to ${title} homepage`}
          >
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
          </Link>

          {tagline && (
            <div className="max-w-sm text-sm text-muted-foreground text-balance">
              <PortableText value={tagline} />
            </div>
          )}

          <Social aria-label="Social media links" />
        </div>

        <Navigation />
      </Section>

      <div className="border-t border-border/40">
        <Section className="flex flex-wrap justify-between items-center py-6 gap-4" spacing="none">
          <div className="flex flex-wrap items-center gap-x-8 gap-y-2 text-sm text-muted-foreground">
            {copyright ? (
              <div className="[&_p]:inline [&_p]:m-0">
                <PortableText value={copyright} />
              </div>
            ) : (
              <p>
                © {new Date().getFullYear()} {title}. All rights reserved.
              </p>
            )}

            {footerLinks?.map((link, i) => {
              const url = link.external || (link.internal && resolveUrl(link.internal));
              if (!url) return null;
              return (
                <Link
                  key={i}
                  href={url}
                  className="hover:text-foreground transition-colors"
                  target={link.newTab ? '_blank' : undefined}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          {systemStatus && <SystemStatus status={systemStatus} />}
        </Section>
      </div>
    </footer>
  );
}
