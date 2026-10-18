/**
 * Gallery documents in Sanity can still contain module types that were removed
 * from the page builder. `blog-frontpage` is the live stray (the article
 * frontpage replaced it). Drop those items so the public gallery only shows
 * registered modules.
 */
const RETIRED_GALLERY_MODULE_TYPES = new Set(['blog-frontpage', 'blog-listing']);

export function isRetiredGalleryModule(moduleType: string | undefined): boolean {
  return moduleType != null && RETIRED_GALLERY_MODULE_TYPES.has(moduleType);
}
