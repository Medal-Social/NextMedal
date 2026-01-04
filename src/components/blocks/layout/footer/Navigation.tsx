import { ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { getLocale } from 'next-intl/server';
import { stegaClean } from 'next-sanity';
import { CTA } from '@/components/blocks/objects/cta';
import resolveUrl from '@/lib/sanity/resolve-url-server';
import { getFooterSettings } from '@/sanity/lib/fetch';

// Extend the type to match PageBase interface
type InternalLink = {
  _type: string;
  title: string;
  slug?: {
    current: string;
  };
  metadata: Sanity.Metadata;
  _id: string;
  _rev: string;
  _createdAt: string;
  _updatedAt: string;
};

type MenuItemType = {
  _type: 'menuItem';
  _key?: string;
  label?: string;
  type?: 'internal' | 'external';
  external?: string;
  internal?: InternalLink;
};

type DropdownMenuType = {
  _type: 'dropdownMenu';
  _key?: string;
  title?: string;
  links?: Array<MenuItemType>;
};

type MenuItem = MenuItemType | DropdownMenuType;

// Get a unique key for menu items
function getItemKey(item: MenuItem, index: number): string {
  if ('_key' in item && typeof item._key === 'string') return item._key;
  if ('label' in item && typeof item.label === 'string') return item.label;
  if ('title' in item && typeof item.title === 'string') return item.title;
  return String(index);
}

// External link component
function ExternalMenuItem({ href, label }: { href: string; label?: string }) {
  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary"
      aria-label={`${label} (opens in new tab)`}
    >
      <div className="flex items-center gap-2">
        {label}
        <ExternalLink className="h-4 w-4" aria-hidden="true" />
      </div>
    </Link>
  );
}

// Internal link component
function InternalMenuItem({ url, label, title }: { url: string; label?: string; title?: string }) {
  return (
    <Link
      href={url}
      className="text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary"
    >
      {label || title}
    </Link>
  );
}

// Single menu item renderer
function MenuItemRenderer({
  item,
  resolvedUrl,
}: {
  item: MenuItemType;
  resolvedUrl?: string | null;
}) {
  if (item.external) {
    return <ExternalMenuItem href={item.external} label={item.label} />;
  }

  if (item.internal && resolvedUrl) {
    return <InternalMenuItem url={resolvedUrl} label={item.label} title={item.internal.title} />;
  }

  return (
    <CTA
      className="text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary"
      link={item as Sanity.MenuItem}
      style="link"
    />
  );
}

// Dropdown link styles
const DROPDOWN_LINK_CLASS =
  'text-muted-foreground text-sm hover:text-foreground motion-safe:transition-all motion-safe:duration-200 motion-safe:hover:translate-x-1 focus:outline-none focus:ring-2 focus:ring-primary';

// Dropdown link renderer
function DropdownLink({ link, resolvedUrl }: { link: MenuItemType; resolvedUrl?: string | null }) {
  if (link.external) {
    return (
      <Link
        href={stegaClean(link.external)}
        target="_blank"
        rel="noopener noreferrer"
        className={DROPDOWN_LINK_CLASS}
        aria-label={`${link.label} (opens in new tab)`}
      >
        <div className="flex items-center gap-1">
          {link.label}
          <ExternalLink className="h-3 w-3" aria-hidden="true" />
        </div>
      </Link>
    );
  }

  if (link.internal && resolvedUrl) {
    return (
      <Link href={resolvedUrl} className={DROPDOWN_LINK_CLASS}>
        {link.label || link.internal.title}
      </Link>
    );
  }

  return <CTA className={DROPDOWN_LINK_CLASS} link={link as Sanity.MenuItem} style="link" />;
}

// Dropdown menu renderer
function DropdownMenuRenderer({
  item,
  resolvedUrls,
}: {
  item: DropdownMenuType;
  resolvedUrls: Map<string, string>;
}) {
  return (
    <>
      <div className="font-semibold text-muted-foreground text-xs uppercase tracking-wider mb-1">
        {item.title}
      </div>

      {item.links && item.links.length > 0 && (
        <ul className="flex flex-col gap-2">
          {item.links.map((link, linkIndex) => {
            const linkKey = getItemKey(link, linkIndex);
            return (
              <li key={linkKey}>
                <DropdownLink link={link} resolvedUrl={resolvedUrls.get(linkKey)} />
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}

// Navigation item wrapper
function NavigationItem({
  item,
  index,
  resolvedUrls,
}: {
  item: MenuItem;
  index: number;
  resolvedUrls: Map<string, string>;
}) {
  const key = getItemKey(item, index);

  return (
    <div className="flex flex-col gap-2" key={key}>
      {item._type === 'menuItem' && (
        <MenuItemRenderer item={item} resolvedUrl={resolvedUrls.get(key)} />
      )}
      {item._type === 'dropdownMenu' && (
        <DropdownMenuRenderer item={item} resolvedUrls={resolvedUrls} />
      )}
    </div>
  );
}

export default async function Menu() {
  const locale = await getLocale();
  const site = await getFooterSettings(locale);

  if (!site?.footerNav?.length) return null;

  const footerNav = site.footerNav as unknown as MenuItem[];

  // Pre-resolve all internal URLs
  const resolvedUrls = new Map<string, string>();

  await Promise.all(
    footerNav.map(async (item, index) => {
      const menuItem = item as MenuItem;
      const itemKey = getItemKey(menuItem, index);

      // Handle menu items
      if (menuItem._type === 'menuItem' && menuItem.internal) {
        const url = await resolveUrl(menuItem.internal, { base: false });
        resolvedUrls.set(itemKey, url);
      }

      // Handle dropdown menus
      if (menuItem._type === 'dropdownMenu' && menuItem.links) {
        await Promise.all(
          menuItem.links.map(async (link, linkIndex) => {
            if (link.internal) {
              const linkKey = getItemKey(link, linkIndex);
              const url = await resolveUrl(link.internal, { base: false });
              resolvedUrls.set(linkKey, url);
            }
          })
        );
      }
    })
  );

  return (
    <nav
      className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8"
      aria-label="Footer navigation"
    >
      {footerNav.map((item, index) => (
        <NavigationItem
          key={getItemKey(item as MenuItem, index)}
          item={item as MenuItem}
          index={index}
          resolvedUrls={resolvedUrls}
        />
      ))}
    </nav>
  );
}
