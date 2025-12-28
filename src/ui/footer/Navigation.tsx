import { ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { stegaClean } from 'next-sanity';
import resolveUrl from '@/lib/resolveUrl';
import { getSite } from '@/sanity/lib/fetch';
import { CTA } from '@/ui/cta';

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
function InternalMenuItem({ internal, label }: { internal: InternalLink; label?: string }) {
  const url = resolveUrl(internal, { base: false });
  return (
    <Link
      href={url}
      className="text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary"
    >
      {label || internal.title}
    </Link>
  );
}

// Single menu item renderer
function MenuItemRenderer({ item }: { item: MenuItemType }) {
  if (item.external) {
    return <ExternalMenuItem href={item.external} label={item.label} />;
  }

  if (item.internal) {
    return <InternalMenuItem internal={item.internal} label={item.label} />;
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
function DropdownLink({ link }: { link: MenuItemType }) {
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

  if (link.internal) {
    return (
      <Link href={resolveUrl(link.internal, { base: false })} className={DROPDOWN_LINK_CLASS}>
        {link.label || link.internal.title}
      </Link>
    );
  }

  return <CTA className={DROPDOWN_LINK_CLASS} link={link as Sanity.MenuItem} style="link" />;
}

// Dropdown menu renderer
function DropdownMenuRenderer({ item }: { item: DropdownMenuType }) {
  return (
    <>
      <div className="font-semibold text-muted-foreground text-xs uppercase tracking-wider mb-1">
        {item.title}
      </div>

      {item.links && item.links.length > 0 && (
        <ul className="flex flex-col gap-2">
          {item.links.map((link, linkIndex) => (
            <li key={getItemKey(link, linkIndex)}>
              <DropdownLink link={link} />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

// Navigation item wrapper
function NavigationItem({ item, index }: { item: MenuItem; index: number }) {
  const key = getItemKey(item, index);

  return (
    <div className="flex flex-col gap-2" key={key}>
      {item._type === 'menuItem' && <MenuItemRenderer item={item} />}
      {item._type === 'dropdownMenu' && <DropdownMenuRenderer item={item} />}
    </div>
  );
}

export default async function Menu() {
  const { footerMenu } = await getSite();

  if (!footerMenu?.items?.length) return null;

  return (
    <nav
      className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8"
      aria-label="Footer navigation"
    >
      {footerMenu.items.map((item, index) => (
        <NavigationItem
          key={getItemKey(item as MenuItem, index)}
          item={item as MenuItem}
          index={index}
        />
      ))}
    </nav>
  );
}
