'use server';

import type { QueryParams } from 'next-sanity';
import { DEFAULT_LOCALE } from '@/i18n/config';
import { fetchSanityLive } from './live';
import {
  FOOTER_SETTINGS_QUERY,
  HEADER_SETTINGS_QUERY,
  SITE_QUERY,
  SOCIAL_LINKS_QUERY,
} from './queries';
export { fetchSanityLive };

export async function fetchSanity<T = unknown>({
  query,
  params = {},
  tags,
  stega,
}: {
  query: string;
  params?: Partial<QueryParams>;
  tags?: string[];
  stega?: boolean;
}) {
  return fetchSanityLive<T>({ query, params, tags, stega });
}

// Full site settings - returns null if missing
// Use for metadata, manifest, and other cases that need complete site settings
export async function getSiteOptional(locale: string = DEFAULT_LOCALE) {
  const site = await fetchSanityLive<Sanity.Site>({
    query: SITE_QUERY,
    params: { language: locale },
  });

  return site ?? null;
}

// Header settings - optimized query for header component
export async function getHeaderSettings(locale: string = DEFAULT_LOCALE) {
  const settings = await fetchSanityLive<Sanity.Site>({
    query: HEADER_SETTINGS_QUERY,
    params: { language: locale },
  });

  return settings ?? null;
}

// Footer settings - optimized query for footer components
export async function getFooterSettings(locale: string = DEFAULT_LOCALE) {
  const settings = await fetchSanityLive<Sanity.Site>({
    query: FOOTER_SETTINGS_QUERY,
    params: { language: locale },
  });

  return settings ?? null;
}

// Social links - optimized query for social links component
export async function getSocialLinks(_locale: string = DEFAULT_LOCALE) {
  const links = await fetchSanityLive<Sanity.Site['socialLinks']>({
    query: SOCIAL_LINKS_QUERY,
  });

  return links ?? null;
}
