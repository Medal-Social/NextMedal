import { ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { stegaClean } from 'next-sanity';
import type * as React from 'react';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import resolveUrl from '@/lib/resolveUrl';
import { getSite } from '@/sanity/lib/fetch';
import type { Metadata } from '@/sanity/lib/types';

interface InternalLink {
  _type: string;
  title: string;
  slug?: {
    current: string;
  };
  metadata: Metadata;
  _id: string;
  _rev: string;
  _createdAt: string;
  _updatedAt: string;
}

export interface MenuItem {
  _type: 'menuItem' | 'dropdownMenu';
  label?: string;
  title?: string;
  internal?: InternalLink;
  external?: string;
  params?: string;
  links?: MenuItem[];
}

interface HeaderMenu {
  items?: MenuItem[];
}

function getLinkHref(item: MenuItem): string {
  if (item.internal?.metadata?.slug?.current) {
    return resolveUrl(item.internal as Sanity.PageBase, {
      base: false,
      params: item.params,
    });
  }
  if (item.external) {
    return stegaClean(item.external);
  }
  return '/';
}

function ListItem({
  title,
  children,
  href,
  className,
  ...props
}: React.ComponentPropsWithoutRef<'li'> & { href: string; title: string }) {
  return (
    <li {...props} className={className}>
      <NavigationMenuLink
        render={
          <Link
            href={href}
            className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            <div className="text-sm font-medium leading-none">{title}</div>
            {children && (
              <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">{children}</p>
            )}
          </Link>
        }
      />
    </li>
  );
}

export default async function Navigation() {
  const { headerMenu } = await getSite();

  return (
    <NavigationMenu>
      <NavigationMenuList>
        {(headerMenu as HeaderMenu)?.items?.map((item) => {
          const itemKey = `${item._type}-${item.label || ''}-${item.title || ''}`;
          switch (item._type) {
            case 'menuItem':
              return (
                <NavigationMenuItem key={itemKey}>
                  <NavigationMenuLink
                    render={
                      <Link
                        href={getLinkHref(item)}
                        className={navigationMenuTriggerStyle()}
                        target={item.external ? '_blank' : undefined}
                        aria-label={item.external ? `${item.label} (opens in new tab)` : undefined}
                      >
                        {item.external ? (
                          <p className="flex items-center gap-2">
                            {item.label} <ExternalLink className="w-3 h-3" aria-hidden="true" />
                          </p>
                        ) : (
                          item.label
                        )}
                      </Link>
                    }
                  />
                </NavigationMenuItem>
              );
            case 'dropdownMenu':
              return (
                <NavigationMenuItem key={itemKey}>
                  <NavigationMenuTrigger aria-label={`${item.title} menu`}>
                    {item.title}
                  </NavigationMenuTrigger>
                  <NavigationMenuContent className="bg-background">
                    <ul className="grid w-64 gap-2 p-4">
                      {item.links?.map((link) => (
                        <ListItem
                          key={link.label}
                          title={link.label || ''}
                          href={getLinkHref(link)}
                        >
                          {/* Description would go here if available */}
                        </ListItem>
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              );
            default:
              return null;
          }
        })}
      </NavigationMenuList>
    </NavigationMenu>
  );
}
