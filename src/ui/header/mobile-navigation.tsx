import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import resolveUrl from '@/lib/resolveUrl';
import CTAList from '@/ui/CTAList';
import { ChevronDown, ExternalLink } from 'lucide-react';
import { stegaClean } from 'next-sanity';
import Link from 'next/link';
import Icon from '../Icon';

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

interface Link {
  label: string;
  description?: string;
  icon?: Sanity.Icon;
  internal?: InternalLink;
  external?: string;
  params?: string;
}

interface MenuItem {
  _type: 'link' | 'link.categories' | 'link.list';
  label?: string;
  title?: string;
  internal?: InternalLink;
  external?: string;
  params?: string;
  categories?: Array<{
    title: string;
    links?: Link[];
  }>;
  link?: Link;
  links?: Link[];
}

interface MobileNavigationProps {
  menu: {
    items?: MenuItem[];
  };
  ctas: any;
}

export const NavLink = ({ link }: { link: Link }) => (
  <Link
    href={
      link.internal
        ? resolveUrl(link.internal, {
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
    {link.icon && <Icon icon={link.icon} className="mt-0.5 h-5 w-5" aria-hidden="true" />}
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
    <div
      className="fixed inset-0 top-[57px] z-50 overflow-hidden bg-background/95 border-foreground/10"
      role="dialog"
      aria-modal="true"
      aria-label="Mobile navigation menu"
    >
      <nav className="h-full overflow-y-auto" aria-label="Mobile navigation">
        <div className="mx-auto max-w-screen-xl p-4 space-y-6">
          <div className="flex items-center justify-between">
            <CTAList ctas={ctas} className="grid flex-1 gap-2 *:w-full" />
          </div>
          <div className="h-px bg-border" role="separator" />
          <ul className="space-y-3" role="menu">
            {menu?.items?.map((item: MenuItem, index: number) => {
              if (item._type === 'link') {
                return (
                  <li key={`mobile-${item.label}-${index}`}>
                    <NavLink link={item as Link} />
                  </li>
                );
              }

              if (item._type === 'link.list') {
                return (
                  <li key={`mobile-${item.link?.label}-${index}`}>
                    <Collapsible>
                      <CollapsibleTrigger
                        className="flex w-full items-center justify-between rounded-md p-2 hover:bg-accent focus:outline-none focus:ring-2 focus:ring-primary"
                        aria-label={`${item.link?.label} submenu`}
                      >
                        <span className="font-medium">{item.link?.label}</span>
                        <ChevronDown className="h-4 w-4" aria-hidden="true" />
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <ul className="ml-4 mt-2 space-y-3 border-l pl-4" role="menu">
                          {item.links?.map((link: Link, linkIndex: number) => (
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

              if (item._type === 'link.categories') {
                return (
                  <li key={`mobile-${item.title}-${index}`}>
                    <Collapsible>
                      <CollapsibleTrigger
                        className="flex w-full items-center justify-between rounded-md p-2 hover:bg-accent focus:outline-none focus:ring-2 focus:ring-primary"
                        aria-label={`${item.title} submenu`}
                      >
                        <span className="font-medium">{item.title}</span>
                        <ChevronDown className="h-4 w-4" aria-hidden="true" />
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <div className="ml-4 mt-2 space-y-6 border-l pl-4" role="menu">
                          {item.categories?.map((category, catIndex: number) => (
                            <div
                              key={`mobile-${category.title}-${index}-${catIndex}`}
                              role="group"
                              aria-label={category.title}
                            >
                              <ul className="space-y-3" role="menu">
                                {category.links?.map((link: Link, linkIndex: number) => (
                                  <li
                                    key={`mobile-${link.label}-${index}-${catIndex}-${linkIndex}`}
                                  >
                                    <NavLink link={link} />
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
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
    </div>
  );
}
