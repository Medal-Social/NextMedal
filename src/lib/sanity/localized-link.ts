import { stegaClean } from 'next-sanity';
import { routing } from '@/i18n/routing';
import { resolveUrlSync } from '@/lib/sanity/resolve-url';

// PageBase has an index signature, so Omit<> would drop its named fields.
type LinkDoc = Pick<Sanity.PageBase, '_type' | 'language'> & {
  _id?: string;
  metadata?: Partial<Sanity.Metadata>;
};

/** An internal link target as LINK_QUERY projects it. */
export type LinkTarget = LinkDoc & {
  translations?: Array<LinkDoc | null> | null;
};

const languageOf = (doc?: { language?: string } | null): string =>
  (doc?.language ? stegaClean(doc.language) : '') || routing.defaultLocale;

/**
 * Vault spec 2026-10-18 D4: a link on a translated page goes to the same
 * document in the visitor's language (translation.metadata). Without a
 * translation it stays on the source document, in its language, on purpose.
 */
export function localizedTarget(
  target: LinkTarget | null | undefined,
  locale: string
): LinkDoc | undefined {
  if (!target) return undefined;
  if (languageOf(target) === locale) return target;
  const translated = target.translations?.find(
    (doc) => !!doc && languageOf(doc) === locale && !!doc.metadata?.slug?.current
  );
  return translated ?? target;
}

/**
 * Props for next-intl's <Link>: the path without a language prefix and the
 * language it belongs to (Link adds the prefix from `locale`).
 */
export function internalLink(
  target: LinkTarget | null | undefined,
  locale: string,
  params?: string
): { href: string; locale: string } | undefined {
  const doc = localizedTarget(target, locale);
  if (!doc) return undefined;
  const language = languageOf(doc);
  let path = resolveUrlSync(doc as Sanity.PageBase, { base: false, params });
  const prefix = `/${language}`;
  if (
    language !== routing.defaultLocale &&
    (path === prefix || /^\/[^/?#]+(?=[/?#]|$)/.exec(path)?.[0] === prefix)
  ) {
    path = path.slice(prefix.length);
  }
  return { href: path.startsWith('/') ? path : `/${path}`, locale: language };
}
