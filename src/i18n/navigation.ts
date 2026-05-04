// Locale-aware navigation primitives. Components rendering internal hrefs
// MUST import Link from here, not from 'next/link', so the active locale
// prefix is applied automatically on non-default locales.
import { createNavigation } from 'next-intl/navigation';
import { routing } from './routing';

export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing);

// For components that build href strings to pass to non-Link components
// (e.g., BreadcrumbLink, anchor tags). Returns the href with the locale
// prefix prepended on non-default locales, or unchanged on the default
// locale. Accepts paths with or without a leading slash and bare query/
// hash fragments — normalized so the result is always a valid pathname.
export function buildLocaleHref(path: string, locale: string): string {
  if (locale === routing.defaultLocale) return path;
  if (path === '' || path === '/') return `/${locale}`;
  // Bare query/hash fragments anchor at root: "?q=1" → "/nb?q=1"
  if (path.startsWith('?') || path.startsWith('#')) return `/${locale}${path}`;
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `/${locale}${normalized}`;
}
