import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import resolveUrl from '@/lib/resolveUrl';
import CTAList from '@/ui/CTAList';
import { ChevronDown, ExternalLink } from 'lucide-react';
import { stegaClean } from 'next-sanity';
import Link from 'next/link';

type SanityReference = { _ref: string; _type: 'reference'; _weak?: boolean };
interface InternalLink {
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
}

export interface MobileNavLink {
  label: string;
  description?: string;
  internal?: InternalLink | SanityReference;
  external?: string;
  params?: string | Record<string, string>;
}

interface MenuItem {
  _type: 'link' | 'link.list';
  label?: string;
  title?: string;
  internal?: InternalLink | SanityReference;
  external?: string;
  params?: string | Record<string, string>;
  link?: MobileNavLink;
  links?: MobileNavLink[];
}

interface MobileNavigationProps {
  menu: {
    items?: MenuItem[];
  };
  ctas: any;
}

export const NavLink = ({ link }: { link: MobileNavLink }) => (
  <Link
    href={
      link.internal && (link.internal as any)._type !== 'reference'
        ? resolveUrl(link.internal as any, {
            base: false,
            params: link.params,
          })
        : link.external
          ? stegaClean(link.external)
          : '/'
    }
    className="flex items-start gap-3 rounded-md p-2 hover:bg-accent text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
    target={link.external ? '_blank' : undefined}
    aria-label={link.external ? `${link.label} (opens in new tab)` : undefined}
  >
    <div>
      <div className="flex items-center gap-2 font-medium">
        {link.label}
        {link.external && <ExternalLink className="h-3 w-3" aria-hidden="true" />}
      </div>
      {link.description && (
        <p className="mt-0.5 text-sm text-muted-foreground">{link.description}</p>
      )}
    </div>
  </Link>
);

export default function MobileNavigation({ menu, ctas }: MobileNavigationProps) {
  return (
    <dialog
      open
      className="fixed inset-0 top-[57px] z-50 overflow-hidden bg-background/95 border-foreground/10"
      aria-modal="true"
      aria-label="Mobile navigation menu"
    >
      <nav className="h-full overflow-y-auto" aria-label="Mobile navigation">
        <div className="mx-auto max-w-screen-xl p-4 space-y-6">
          <div className="flex items-center justify-between">
            <CTAList ctas={ctas} className="grid flex-1 gap-2 *:w-full" />
          </div>
          <div className="h-px bg-border" role="separator" tabIndex={0} />
          <ul className="space-y-3" role="menu">
            {menu?.items?.map((item: MenuItem, index: number) => {
              if (item._type === 'link') {
                return (
                  <li key={`mobile-${item.label}-${index}`}>
                    <NavLink link={item as MobileNavLink} />
                  </li>
                );
              }

              if (item._type === 'link.list') {
                return (
                  <li key={`mobile-${item.link?.label}-${index}`}>
                    <Collapsible>
                      <CollapsibleTrigger
                        className="flex w-full items-center justify-between rounded-md p-2 hover:bg-accent focus:outline-none focus:ring-2 focus:ring-primary"
                        aria-label={`${item.label} submenu`}
                      >
                        <span className="font-medium">{item.label}</span>
                        <ChevronDown className="h-4 w-4" aria-hidden="true" />
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <ul className="ml-4 mt-2 space-y-3 border-l pl-4" role="menu">
                          {item.links?.map((link: MobileNavLink, linkIndex: number) => (
                            <li key={`mobile-${link.label}-${index}-${linkIndex}`}>
                              <NavLink link={link} />
                            </li>
                          ))}
                        </ul>
                      </CollapsibleContent>
                    </Collapsible>
                  </li>
                );
              }
              return null;
            })}
          </ul>
        </div>
      </nav>
    </dialog>
  );
}
