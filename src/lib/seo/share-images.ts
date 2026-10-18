/**
 * Designed share images (1200×630) approved 18 Oct 2026.
 * Each public route and page-builder module maps to a PNG in `public/og/`.
 * `/og-fallback.png` is only used when nothing in the tables matches.
 */

export const SHARE_IMAGE_WIDTH = 1200;
export const SHARE_IMAGE_HEIGHT = 630;

/** Static card used only when no route, collection, or module image matches. */
export const SHARE_IMAGE_FALLBACK_PATH = '/og-fallback.png';

export type ShareImage = {
  url: string;
  alt: string;
  /** Set only when the delivered image is actually 1200×630. */
  width?: typeof SHARE_IMAGE_WIDTH;
  height?: typeof SHARE_IMAGE_HEIGHT;
  type?: 'image/png' | 'image/jpeg' | 'image/webp' | 'image/gif';
};

/** Sanity CDN transform that crops an upload to the share-card size. */
export const SANITY_SHARE_IMAGE_QUERY = '?w=1200&h=630&fit=crop';

const SANITY_CDN_HOST = 'cdn.sanity.io';

/** Documentation articles that use the README quick-setup card. */
const DOCUMENTATION_SETUP_SLUGS = new Set(['quick-start', 'getting-started', 'installation']);

const PAGE_DOCUMENT_TYPES = new Set(['page', 'component.library']);

type ShareImageEntry = {
  file: string;
  alt: string;
};

const designed = (file: string, alt: string): ShareImageEntry => ({ file, alt });

/**
 * Page slugs (no locale prefix). `index` is `/`.
 * Collection frontpages are listed under both the live slug (`now`) and the
 * generated default (`articles`) so either URL gets the designed card.
 */
export const ROUTE_SHARE_IMAGES = {
  index: designed('home.png', 'Open-source and free to use. Built and maintained by Medal Social.'),
  components: designed(
    'components.png',
    '21 page-builder modules in five groups, ready to drop into any page.'
  ),
  docs: designed('docs.png', 'Getting started, components and guides.'),
  now: designed('articles-frontpage.png', 'Displays a list of articles from a collection.'),
  articles: designed('articles-frontpage.png', 'Displays a list of articles from a collection.'),
  changelog: designed(
    'changelog-frontpage.png',
    'Module for displaying a changelog and release notes on a page.'
  ),
  events: designed('events-frontpage.png', 'Displays a list of events from a collection.'),
  newsletter: designed(
    'newsletter-frontpage.png',
    'Displays a list of newsletter issues from a collection.'
  ),
  'quick-start': designed(
    'getting-started.png',
    'Clone and install, configure your environment, start developing.'
  ),
  'getting-started': designed(
    'getting-started.png',
    'Clone and install, configure your environment, start developing.'
  ),
  installation: designed(
    'getting-started.png',
    'Clone and install, configure your environment, start developing.'
  ),
} as const satisfies Record<string, ShareImageEntry>;

/** Sanity module `_type` → designed card. Includes modules that have no public route of their own. */
export const MODULE_SHARE_IMAGES = {
  hero: designed('hero.png', 'Eye-catching headers with gradient backgrounds, images, and CTAs.'),
  videoHero: designed(
    'video-hero.png',
    'A high-impact hero section featuring a background video (Mux or YouTube).'
  ),
  richtext: designed('richtext.png', 'A standard rich text module for long-form content.'),
  'accordion-list': designed(
    'accordion-list.png',
    'A list of collapsible content items (e.g. FAQs).'
  ),
  features: designed('features.png', 'Grid layout of features with icons and descriptions.'),
  'logo-cloud': designed('logo-cloud.png', 'Displays a grid of partner and client logos.'),
  flipbook: designed('flipbook.png', 'A PDF shown as a page-turning flipbook.'),
  team: designed('team.png', 'Displays a list of team members in a grid or list layout.'),
  'pricing-list': designed('pricing-list.png', 'Displays a list of pricing tiers and plans.'),
  'product-comparison': designed(
    'product-comparison.png',
    'A comparison table for products and features with customizable details for each cell.'
  ),
  callout: designed('callout.png', 'A highlighted section with content and call-to-actions.'),
  contact: designed(
    'contact.png',
    'Standard contact module with reusable form support and contact details.'
  ),
  'lead-magnet': designed(
    'lead-magnet.png',
    'Flexible lead generation module with refined Studio UX.'
  ),
  'articles-frontpage': designed(
    'articles-frontpage.png',
    'Displays a list of articles from a collection.'
  ),
  'changelog-frontpage': designed(
    'changelog-frontpage.png',
    'Module for displaying a changelog and release notes on a page.'
  ),
  'docs-frontpage': designed('docs-frontpage.png', 'Displays documentation navigation on a page.'),
  'events-frontpage': designed(
    'events-frontpage.png',
    'Displays a list of events from a collection.'
  ),
  'newsletter-frontpage': designed(
    'newsletter-frontpage.png',
    'Displays a list of newsletter issues from a collection.'
  ),
  breadcrumbs: designed(
    'breadcrumbs.png',
    'Automatically generated breadcrumbs based on page structure.'
  ),
  'component-gallery': designed(
    'component-gallery.png',
    'A visual gallery of all available UI components for demonstration and testing.'
  ),
  'latest-articles': designed(
    'latest-articles.png',
    'Displays a list of recent articles with filtering options.'
  ),
  'pricing-comparison': designed(
    'pricing-comparison.png',
    'A module for displaying and comparing pricing plans with features and tiers.'
  ),
} as const satisfies Record<string, ShareImageEntry>;

/** Collection documents share the frontpage card for that collection. */
export const COLLECTION_SHARE_IMAGES = {
  'collection.article': designed(
    'articles-frontpage.png',
    'Displays a list of articles from a collection.'
  ),
  'collection.changelog': designed(
    'changelog-frontpage.png',
    'Module for displaying a changelog and release notes on a page.'
  ),
  'collection.documentation': designed('docs.png', 'Getting started, components and guides.'),
  'collection.events': designed(
    'events-frontpage.png',
    'Displays a list of events from a collection.'
  ),
  'collection.newsletter': designed(
    'newsletter-frontpage.png',
    'Displays a list of newsletter issues from a collection.'
  ),
} as const satisfies Record<string, ShareImageEntry>;

export type ShareImagePage = {
  _type?: string;
  metadata?: { slug?: { current?: string }; ogimage?: string; title?: string };
  seo?: { ogimage?: string; title?: string };
  modules?: Array<{ _type?: string } | null> | null;
  collectionType?: string;
};

function joinBase(baseUrl: string, path: string): string {
  const base = baseUrl.replace(/\/+$/, '');
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
}

function imageType(url: string): ShareImage['type'] {
  const clean = url.split('?')[0]?.toLowerCase() ?? '';
  if (clean.endsWith('.png')) return 'image/png';
  if (clean.endsWith('.jpg') || clean.endsWith('.jpeg')) return 'image/jpeg';
  if (clean.endsWith('.webp')) return 'image/webp';
  if (clean.endsWith('.gif')) return 'image/gif';
  return undefined;
}

export function shareImageFromEntry(entry: ShareImageEntry, baseUrl: string): ShareImage {
  const url = joinBase(baseUrl, `/og/${entry.file}`);
  return {
    url,
    width: SHARE_IMAGE_WIDTH,
    height: SHARE_IMAGE_HEIGHT,
    alt: entry.alt,
    type: 'image/png',
  };
}

/**
 * Crop Sanity CDN uploads to 1200×630 so the declared size matches the bytes.
 * Other hosts are returned unchanged and without a size, because this app cannot crop them.
 */
export function shareImageFromUpload(url: string, alt: string): ShareImage {
  const cropped = cropSanityShareImage(url);
  const delivered = cropped ?? url;
  const type = imageType(delivered);
  return {
    url: delivered,
    alt,
    ...(cropped ? { width: SHARE_IMAGE_WIDTH, height: SHARE_IMAGE_HEIGHT } : {}),
    ...(type ? { type } : {}),
  };
}

function cropSanityShareImage(url: string): string | undefined {
  try {
    const parsed = new URL(url);
    if (parsed.hostname !== SANITY_CDN_HOST) return undefined;
    parsed.searchParams.set('w', '1200');
    parsed.searchParams.set('h', '630');
    parsed.searchParams.set('fit', 'crop');
    return parsed.toString();
  } catch {
    return undefined;
  }
}

export function shareImageFallback(baseUrl: string, alt: string): ShareImage {
  const url = joinBase(baseUrl, SHARE_IMAGE_FALLBACK_PATH);
  return {
    url,
    width: SHARE_IMAGE_WIDTH,
    height: SHARE_IMAGE_HEIGHT,
    alt,
    type: 'image/png',
  };
}

function entryForSlug(slug: string | undefined): ShareImageEntry | undefined {
  if (!slug || !Object.hasOwn(ROUTE_SHARE_IMAGES, slug)) return undefined;
  return ROUTE_SHARE_IMAGES[slug as keyof typeof ROUTE_SHARE_IMAGES];
}

function entryForModuleType(moduleType: string | undefined): ShareImageEntry | undefined {
  if (!moduleType || !Object.hasOwn(MODULE_SHARE_IMAGES, moduleType)) return undefined;
  return MODULE_SHARE_IMAGES[moduleType as keyof typeof MODULE_SHARE_IMAGES];
}

function entryForCollection(documentType: string | undefined): ShareImageEntry | undefined {
  if (!documentType || !Object.hasOwn(COLLECTION_SHARE_IMAGES, documentType)) return undefined;
  return COLLECTION_SHARE_IMAGES[documentType as keyof typeof COLLECTION_SHARE_IMAGES];
}

function isPageDocument(documentType: string | undefined): boolean {
  return documentType == null || PAGE_DOCUMENT_TYPES.has(documentType);
}

/**
 * Pick the share image for a document.
 * Order: editor upload, page route, documentation quick-setup card, collection card,
 * leading module that has a card, static fallback.
 * Route keys are not applied to collection items, so an article slug of `components`
 * stays on the articles card.
 */
export function resolveShareImage(
  page: ShareImagePage,
  baseUrl: string,
  altFallback: string
): ShareImage {
  const uploaded = page.seo?.ogimage || page.metadata?.ogimage;
  if (uploaded) return shareImageFromUpload(uploaded, altFallback);

  const slug = page.metadata?.slug?.current;

  if (isPageDocument(page._type) && slug && !DOCUMENTATION_SETUP_SLUGS.has(slug)) {
    const routeEntry = entryForSlug(slug);
    if (routeEntry) return shareImageFromEntry(routeEntry, baseUrl);
  }

  if (page._type === 'collection.documentation' && slug && DOCUMENTATION_SETUP_SLUGS.has(slug)) {
    return shareImageFromEntry(ROUTE_SHARE_IMAGES['getting-started'], baseUrl);
  }

  const collectionEntry =
    entryForCollection(page._type) ??
    entryForModuleType(page.collectionType) ??
    entryForCollection(page.collectionType);
  if (collectionEntry) return shareImageFromEntry(collectionEntry, baseUrl);

  for (const module of page.modules ?? []) {
    const moduleEntry = entryForModuleType(module?._type);
    if (moduleEntry) return shareImageFromEntry(moduleEntry, baseUrl);
  }

  return shareImageFallback(baseUrl, altFallback);
}
