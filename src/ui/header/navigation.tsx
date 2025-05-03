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
import { ExternalLink } from 'lucide-react';
import { stegaClean } from 'next-sanity';
import { NavLink } from './mobile-navigation';
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

interface Category {
  title: string;
  links?: Link[];
}

interface Link {
  label: string;
  description?: string;
  icon?: Sanity.Icon;
  internal?: InternalLink;
  external?: string;
  params?: string;
}

export interface MenuItem {
  _type: 'link' | 'link.categories' | 'link.list';
  label?: string;
  title?: string;
  internal?: InternalLink;
  external?: string;
  params?: string;
  categories?: Category[];
  link?: Link;
  links?: Link[];
}

interface HeaderMenu {
  items?: MenuItem[];
}

export default async function Navigation() {
  const { headerMenu } = await getSite();

  return (
    <NavigationMenu>
      <NavigationMenuList>
        {(headerMenu as HeaderMenu)?.items?.map((item, key) => {
          switch (item._type) {
            case 'link':
              return (
                <NavigationMenuItem key={key}>
                  <Link
                    href={
                      item.internal && item.internal.metadata?.slug
                        ? resolveUrl(item.internal, {
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
                <NavigationMenuItem key={key}>
                  <NavigationMenuTrigger aria-label={`${item.title} menu`}>
                    {item.title}
                  </NavigationMenuTrigger>
                  <NavigationMenuContent className="bg-background">
                    <ul className="flex flex-row w-[800px] gap-3 p-4" role="menu">
                      {item.categories?.map((category, ix) => (
                        <li
                          key={`${category.title}-${key}-${ix}`}
                          className="overflow-hidden flex-grow"
                          role="presentation"
                        >
                          <span className="font-medium text-base text-foreground mb-2">
                            {category.title}
                          </span>
                          <ul className="space-y-2" role="group">
                            {category.links?.map((link, ix) => (
                              <NavigationMenuLink asChild key={`${link.label}-${key}-${ix}`}>
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
                <NavigationMenuItem key={key}>
                  <NavigationMenuTrigger aria-label={`${item.link?.label} menu`}>
                    {item.link?.label}
                  </NavigationMenuTrigger>
                  <NavigationMenuContent className="bg-background">
                    <ul className="grid w-[600px] gap-3 p-4 grid-cols-2" role="menu">
                      {item.links?.map((link, ix) => (
                        <NavigationMenuLink asChild key={`${link.label}-${key}-${ix}`}>
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
