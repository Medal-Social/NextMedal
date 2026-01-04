/**
 * Header component type definitions
 * Provides type safety for header-related components
 */

import type { ReactNode } from 'react';

/**
 * Menu item for navigation - uses Sanity.MenuItem from global types
 */
export type HeaderMenuItem = Sanity.MenuItem;

/**
 * Dropdown menu containing multiple menu items - uses Sanity.DropdownMenu
 */
export type HeaderDropdownMenu = Sanity.DropdownMenu;

/**
 * Navigation menu structure
 */
export interface HeaderMenu {
  items?: (Sanity.MenuItem | Sanity.DropdownMenu)[];
}

/**
 * Call-to-action button configuration - uses Sanity.CTA
 */
export type HeaderCTA = Sanity.CTA;

/**
 * Logo configuration - uses Sanity.Logo
 */
export type HeaderLogo = Sanity.Logo;

/**
 * Props for HeaderClient component
 */
export interface HeaderClientProps extends React.ComponentProps<'header'> {
  /** Call-to-action buttons */
  ctas: HeaderCTA[];
  /** Navigation menu configuration */
  menu: HeaderMenu;
  /** Whether search is enabled */
  enableSearch?: boolean;
  /** Children to render inside the header */
  /** Children to render inside the header */
  children?: ReactNode;
  logoNode: ReactNode;
  navNode: ReactNode;
  ctaNode: ReactNode;
  localeSwitcherNode?: ReactNode;
}

/**
 * Props for MobileNavigation component
 */
export interface MobileNavigationProps {
  /** Navigation menu configuration */
  menu: HeaderMenu;
  /** Call-to-action buttons */
  ctas: HeaderCTA[];
  /** Whether search is enabled */
  enableSearch?: boolean;
}

/**
 * Props for Logo component
 */
export interface LogoProps {
  /** Site title for fallback text */
  title: string;
  /** Logo configuration from CMS */
  logo: HeaderLogo | undefined;
  /** Brand page slug for context menu */
  brandPage: string | undefined;
  /** Current locale for generating locale-aware homepage link */
  locale: string;
}

/**
 * Search result item from API
 */
export interface SearchResultItem {
  _id: string;
  title: string;
  href: string;
  type: 'Articles' | 'Page' | 'Docs' | 'Changelog' | 'Newsletter';
}
