import { ExternalLink } from 'lucide-react';
import { getLocale } from 'next-intl/server';
import { stegaClean } from 'next-sanity';
import { CTA } from '@/components/blocks/objects/cta';
import { Link } from '@/i18n/navigation';
import { internalLink, type LinkTarget } from '@/lib/sanity/localized-link';
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
  language?: string;
  translations?: LinkTarget['translations'];
};

type ResolvedLink = { href: string; locale: string };

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
  links?: MenuItemType[];
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
      className="font-medium text-sm focus:outline-none focus:ring-2 focus:ring-primary"
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
function InternalMenuItem({
  link,
  label,
  title,
}: {
  link: ResolvedLink;
  label?: string;
  title?: string;
}) {
  return (
    <Link
      href={link.href}
      locale={link.locale}
      className="font-medium text-sm focus:outline-none focus:ring-2 focus:ring-primary"
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
  resolvedUrl?: ResolvedLink | null;
}) {
  if (item.external) {
    return <ExternalMenuItem href={item.external} label={item.label} />;
  }

  if (item.internal && resolvedUrl) {
    return <InternalMenuItem link={resolvedUrl} label={item.label} title={item.internal.title} />;
  }

  return (
    <CTA
      className="font-medium text-sm focus:outline-none focus:ring-2 focus:ring-primary"
      link={item as Sanity.MenuItem}
      style="link"
    />
  );
}

// Dropdown link styles
const DROPDOWN_LINK_CLASS =
  'text-muted-foreground text-sm hover:text-foreground motion-safe:transition-all motion-safe:duration-200 motion-safe:hover:translate-x-1 focus:outline-none focus:ring-2 focus:ring-primary';

// Dropdown link renderer
function DropdownLink({
  link,
  resolvedUrl,
}: {
  link: MenuItemType;
  resolvedUrl?: ResolvedLink | null;
}) {
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
      <Link href={resolvedUrl.href} locale={resolvedUrl.locale} className={DROPDOWN_LINK_CLASS}>
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
  resolvedUrls: Map<string, ResolvedLink>;
}) {
  return (
    <>
      <div className="mb-1 font-semibold text-muted-foreground text-xs uppercase tracking-wider">
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
  resolvedUrls: Map<string, ResolvedLink>;
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
  const resolvedUrls = new Map<string, ResolvedLink>();

  for (const [index, item] of footerNav.entries()) {
    const menuItem = item as MenuItem;
    const itemKey = getItemKey(menuItem, index);

    // Handle menu items
    if (menuItem._type === 'menuItem' && menuItem.internal) {
      const link = internalLink(menuItem.internal as LinkTarget, locale);
      if (link) resolvedUrls.set(itemKey, link);
    }

    // Handle dropdown menus
    if (menuItem._type === 'dropdownMenu' && menuItem.links) {
      for (const [linkIndex, link] of menuItem.links.entries()) {
        if (!link.internal) continue;
        const resolved = internalLink(link.internal as LinkTarget, locale);
        if (resolved) resolvedUrls.set(getItemKey(link, linkIndex), resolved);
      }
    }
  }

  return (
    <nav
      className="grid grid-cols-2 gap-8 md:grid-cols-3 lg:grid-cols-4"
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
