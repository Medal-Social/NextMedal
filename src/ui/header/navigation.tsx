import Link from 'next/link';

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
import { ExternalLink } from 'lucide-react';
import { stegaClean } from 'next-sanity';
import { NavLink } from './mobile-navigation';

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

interface NavMenuLink {
  label: string;
  description?: string;
  icon?: Sanity.Icon;
  internal?: InternalLink;
  external?: string;
  params?: string;
}

interface Category {
  title: string;
  links?: NavMenuLink[];
}

export interface MenuItem {
  _type: 'link' | 'link.categories' | 'link.list';
  label?: string;
  title?: string;
  internal?: InternalLink;
  external?: string;
  params?: string;
  categories?: Category[];
  link?: NavMenuLink;
  links?: NavMenuLink[];
}

interface HeaderMenu {
  items?: MenuItem[];
}

export default async function Navigation() {
  const { headerMenu } = await getSite();

  return (
    <NavigationMenu>
      <NavigationMenuList>
        {(headerMenu as HeaderMenu)?.items?.map((item) => {
          const itemKey = `${item._type}-${item.label || ''}-${item.title || ''}`;
          switch (item._type) {
            case 'link':
              return (
                <NavigationMenuItem key={itemKey}>
                  <Link
                    href={
                      item.internal?.metadata?.slug?.current
                        ? resolveUrl(item.internal as Sanity.PageBase, {
                            base: false,
                            params: item.params,
                          })
                        : item.external
                          ? stegaClean(item.external)
                          : '/'
                    }
                    legacyBehavior
                    passHref
                  >
                    <NavigationMenuLink
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
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
              );

            case 'link.categories':
              return (
                <NavigationMenuItem key={itemKey}>
                  <NavigationMenuTrigger aria-label={`${item.title} menu`}>
                    {item.title}
                  </NavigationMenuTrigger>
                  <NavigationMenuContent className="bg-background">
                    <ul className="flex flex-row w-[800px] gap-3 p-4" role="menu">
                      {item.categories?.map((category) => (
                        <li
                          key={category.title}
                          className="overflow-hidden flex-grow"
                          role="presentation"
                        >
                          <span className="font-medium text-base text-foreground mb-2">
                            {category.title}
                          </span>
                          <ul className="space-y-2" role="group">
                            {category.links?.map((link) => (
                              <NavigationMenuLink asChild key={link.label}>
                                <NavLink link={link} />
                              </NavigationMenuLink>
                            ))}
                          </ul>
                        </li>
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              );
            case 'link.list':
              return (
                <NavigationMenuItem key={itemKey}>
                  <NavigationMenuTrigger aria-label={`${item.link?.label} menu`}>
                    {item.link?.label}
                  </NavigationMenuTrigger>
                  <NavigationMenuContent className="bg-background">
                    <ul className="grid w-[600px] gap-3 p-4 grid-cols-2" role="menu">
                      {item.links?.map((link) => (
                        <NavigationMenuLink asChild key={link.label}>
                          <NavLink link={link} />
                        </NavigationMenuLink>
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
