// Locale-aware navigation primitives. Link adds the *active* locale prefix,
// so use it for hand-written app paths ("/", "/search").
// Sanity internal links are different: build them with internalHref() from
// '@/lib/sanity/localized-link' (it picks the target's language and adds the
// prefix itself, none for English) and render them with a plain 'next/link'.
// Passing an internalHref() result to this Link doubles the prefix (/nb/nb/…).
// For other prefixed href strings use withLocalePrefix() from the same module.
import { createNavigation } from 'next-intl/navigation';
import { routing } from './routing';

export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing);
