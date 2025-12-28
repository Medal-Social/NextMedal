import type { ComponentType } from 'react';

export interface ModuleConfig {
  // biome-ignore lint/suspicious/noExplicitAny: ComponentType<any> is required for heterogeneous component registry
  component: ComponentType<any>;
  /** Custom prop transformation (e.g., breadcrumbs needs currentPage) */
  getProps?: (module: Sanity.Module, context: ModuleContext) => Record<string, unknown>;
}

export interface ModuleContext {
  page?: Sanity.Page | Sanity.ComponentLibrary;
  post?: Sanity.BlogPost;
  isSidebar?: boolean;
}

export type ModuleRegistry = Record<string, ModuleConfig>;
