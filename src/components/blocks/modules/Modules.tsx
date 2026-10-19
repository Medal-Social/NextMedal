import { blockDesign, type DesignPage } from './block-design';
import { ModuleRenderer } from './ModuleRenderer';
import type { FilterParams, ModuleContext, SidebarProps } from './types';

export default function Modules({
  modules,
  page,
  post,
  isSidebar = false,
  searchParams,
  locale,
}: {
  modules?: Sanity.Module[];
  page?: Sanity.Page | Sanity.ComponentLibrary;
  post?: Sanity.CollectionArticlePost;
  isSidebar?: boolean;
  searchParams?: FilterParams;
  /** Route locale, for placements (no page) so language rules still apply. */
  locale?: string;
}) {
  if (!modules?.length) {
    return null;
  }

  const context: ModuleContext = { page, post, isSidebar };
  const sidebarProps: SidebarProps = isSidebar ? { spacing: 'none', width: 'full' } : {};
  // Design values come from code (blockDesign, Vault spec 2026-10-18 D2/D3),
  // not from content. Anchors are computed over the list actually rendered;
  // placements (no page) get the design but no page anchors, so they never
  // duplicate an id of the page below them.
  const designPage: DesignPage = page
    ? { ...(page as DesignPage), modules }
    : { language: locale, modules: [] };

  return (
    <>
      {modules.map((stored) => {
        if (!stored) return null;
        const module = isSidebar ? stored : blockDesign(stored, designPage);

        return (
          <ModuleRenderer
            key={module._key}
            module={module}
            context={context}
            sidebarProps={sidebarProps}
            searchParams={searchParams}
          />
        );
      })}
    </>
  );
}
