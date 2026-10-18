import { internalHref, type LinkTarget } from '@/lib/sanity/localized-link';
import { validateExternalUrl } from '@/lib/validateExternalUrl';

/** The `acceptance.link` menu item of a form, as LINK_QUERY projects it. */
export interface ConsentLink {
  type?: 'internal' | 'external';
  internal?: LinkTarget | null;
  external?: string;
  params?: string;
}

/** Where the consent text links to, in the visitor's language. */
export function consentLinkHref(link: ConsentLink | undefined, locale: string): string | undefined {
  if (!link) return undefined;
  if (link.type === 'external') return validateExternalUrl(link.external ?? '') ?? undefined;
  return link.internal?.metadata?.slug?.current
    ? internalHref(link.internal, locale, link.params)
    : undefined;
}
