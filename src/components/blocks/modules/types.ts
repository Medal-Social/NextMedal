/**
 * Shared types for module components
 */

export interface ModuleContext {
  page?: Sanity.Page | Sanity.ComponentLibrary;
  post?: Sanity.CollectionArticlePost;
  isSidebar?: boolean;
}

export type SidebarProps = {
  spacing?: 'default' | 'compact' | 'relaxed' | 'none';
  width?: 'default' | 'narrow' | 'wide' | 'full';
};

/**
 * Normalized filter parameters from URL searchParams
 *
 * Used by frontpage modules for filtering, pagination, and search.
 */
export type FilterParams = {
  page?: string;
  category?: string;
  author?: string;
  search?: string;
};
