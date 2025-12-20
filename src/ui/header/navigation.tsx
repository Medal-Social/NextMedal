import { ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { stegaClean } from 'next-sanity';
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
import type { MenuItem as MenuItemType, Metadata } from '@/sanity/lib/types';
import { type MobileNavLink, NavLink } from './mobile-navigation';

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
  links?: MenuItemType[];
}

interface HeaderMenu {
  items?: MenuItem[];
}

// Helper to parse params string to Record<string, string>
function _parseParams(params?: string): Record<string, string> | undefined {
  if (!params) return undefined;
  try {
    const searchParams = new URLSearchParams(params);
    const result: Record<string, string> = {};
    for (const [key, value] of searchParams.entries()) {
      result[key] = value;
    }
    return result;
  } catch {
    return undefined;
  }
}

function mapToMobileNavLink(link: MenuItemType): MobileNavLink {
  return {
    label: link.label ?? '',
    internal: link.internal,
    external: link.external,
    params: link.params,
  };
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
                  <NavigationMenuLink asChild>
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
                  </NavigationMenuLink>
                </NavigationMenuItem>
              );
            case 'dropdownMenu':
              return (
                <NavigationMenuItem key={itemKey}>
                  <NavigationMenuTrigger aria-label={`${item.title} menu`}>
                    {item.title}
                  </NavigationMenuTrigger>
                  <NavigationMenuContent className="bg-background">
                    <ul className="grid w-[600px] gap-3 p-4 grid-cols-2">
                      {item.links?.map((link) => (
                        <NavigationMenuLink asChild key={link.label}>
                          <NavLink link={mapToMobileNavLink(link)} />
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
