/**
 * Gallery documents in Sanity can still contain module types that were removed
 * from the page builder. `blog-frontpage` is the live stray (the article
 * frontpage replaced it); `team` until the lean-schema migration drops the
 * stored Team item (the block is deleted). Drop those items so the public
 * gallery only shows registered modules, never an empty tile.
 */
const RETIRED_GALLERY_MODULE_TYPES = new Set(['blog-frontpage', 'blog-listing', 'team']);

export function isRetiredGalleryModule(moduleType: string | undefined): boolean {
  return moduleType != null && RETIRED_GALLERY_MODULE_TYPES.has(moduleType);
}
