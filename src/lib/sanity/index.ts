// URL resolution
export { isRelativeUrl, resolveAnyUrl, resolveUrlSync } from './resolve-url';
// NOTE: Server Components should import resolveUrl from './resolve-url-server' directly

// Current page fetching
export { getCurrentPage } from './get-current-page';

// Module utilities
export { default as moduleProps } from './module-props';
export type { Placement, PlacementLocation, Placements } from './placement';
// Content placement
export { groupPlacements } from './placement';
// SEO metadata
export { default as processMetadata } from './process-metadata';
