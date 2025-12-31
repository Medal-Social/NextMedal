// URL resolution

// Current page fetching
export { getCurrentPage } from './get-current-page';

// Module utilities
export { default as moduleProps } from './module-props';
export type { Placement, PlacementLocation, Placements } from './placement';
// Content placement
export { groupPlacements } from './placement';
// SEO metadata
export { default as processMetadata } from './process-metadata';
export { default as resolveUrl, isRelativeUrl, resolveAnyUrl } from './resolve-url';
