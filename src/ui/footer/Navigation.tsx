import resolveUrl from '@/lib/resolveUrl';
import { getSite } from '@/sanity/lib/fetch';
import CTA from '@/ui/CTA';
import { ExternalLink } from 'lucide-react';
import { stegaClean } from 'next-sanity';
import Link from 'next/link';

// Extend the type to match PageBase interface
type InternalLink = {
  _type: string;
  title: string;
  slug?: {
    current: string;
  };
  metadata: any;
  _id: string;
  _rev: string;
  _createdAt: string;
  _updatedAt: string;
};

export default async function Menu() {
  const { footerMenu } = await getSite();

  if (!footerMenu?.items?.length) return null;

  return (
    <nav
      className="flex flex-wrap items-start gap-x-12 gap-y-6 max-sm:flex-col"
      aria-label="Footer navigation"
    >
      {footerMenu?.items?.map((item, key) => {
        switch (item._type) {
          case 'link':
            if (item.external) {
              return (
                <div className="flex flex-col gap-2" key={key} role="navigation">
                  <h2 className="text-base font-medium">
                    <Link
                      href={item.external}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="focus:outline-none focus:ring-2 focus:ring-primary"
                      aria-label={`${item.label} (opens in new tab)`}
                    >
                      <div className="flex items-center gap-2">
                        {item.label}
                        <ExternalLink className="h-4 w-4" aria-hidden="true" />
                      </div>
                    </Link>
                  </h2>
                </div>
              );
            }
            if (item.internal) {
              const url = resolveUrl(item.internal as InternalLink, {
                base: false,
              });
              return (
                <div className="flex flex-col gap-2" key={key} role="navigation">
                  <h2 className="text-base font-medium">
                    <Link href={url} className="focus:outline-none focus:ring-2 focus:ring-primary">
                      {item.label || item.internal.title}
                    </Link>
                  </h2>
                </div>
              );
            }
            return (
              <div className="flex flex-col gap-2" key={key} role="navigation">
                <h2 className="text-base font-medium">
                  <CTA
                    className="focus:outline-none focus:ring-2 focus:ring-primary"
                    link={item}
                    style="link"
                  />
                </h2>
              </div>
            );

          case 'link.list':
            return (
              <div className="flex flex-col gap-2" key={key} role="navigation">
                {item.link?.external ? (
                  <h2 className="text-sm font-medium">{item.link.label}</h2>
                ) : item.link?.internal ? (
                  <h2 className="text-sm font-medium">
                    {stegaClean(item.link?.label) || item.link?.internal?.title}
                  </h2>
                ) : item.link ? (
                  <h2 className="text-sm font-medium">
                    {stegaClean(item.link?.label) || item.link?.internal?.title}
                  </h2>
                ) : null}

                {item.links && item.links.length > 0 && (
                  <ul className="flex flex-col gap-2" role="list">
                    {item.links.map((link, key) => (
                      <li key={key}>
                        {link.external ? (
                          <Link
                            href={stegaClean(link.external)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-muted-foreground text-sm hover:text-foreground hover:underline focus:outline-none focus:ring-2 focus:ring-primary"
                            aria-label={`${link.label} (opens in new tab)`}
                          >
                            <div className="flex items-center gap-1">
                              {link.label}
                              <ExternalLink className="h-3 w-3" aria-hidden="true" />
                            </div>
                          </Link>
                        ) : link.internal ? (
                          <Link
                            href={resolveUrl(link.internal as InternalLink, {
                              base: false,
                            })}
                            className="text-muted-foreground text-sm hover:text-foreground hover:underline focus:outline-none focus:ring-2 focus:ring-primary"
                          >
                            {link.label || link.internal.title}
                          </Link>
                        ) : link ? (
                          <CTA
                            className="text-muted-foreground text-sm hover:text-foreground hover:underline focus:outline-none focus:ring-2 focus:ring-primary"
                            link={link}
                            style="link"
                          />
                        ) : null}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );

          default:
            return null;
        }
      })}
    </nav>
  );
}
