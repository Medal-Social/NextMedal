import { pageAnchors } from '@/lib/block-anchors';
import { ModuleRenderer } from './ModuleRenderer';
import type { FilterParams, ModuleContext, SidebarProps } from './types';

export default function Modules({
  modules,
  page,
  post,
  isSidebar = false,
  searchParams,
}: {
  modules?: Sanity.Module[];
  page?: Sanity.Page | Sanity.ComponentLibrary;
  post?: Sanity.CollectionArticlePost;
  isSidebar?: boolean;
  searchParams?: FilterParams;
}) {
  if (!modules?.length) {
    return null;
  }

  const context: ModuleContext = { page, post, isSidebar };
  const sidebarProps: SidebarProps = isSidebar ? { spacing: 'none', width: 'full' } : {};
  const anchors = isSidebar ? new Map<string, string>() : pageAnchors(modules);

  return (
    <>
      {modules.map((stored) => {
        if (!stored) return null;
        // Fixed anchors from code (Vault spec 2026-10-18 D3), never from content.
        const anchorId = anchors.get(stored._key);
        const module = anchorId ? { ...stored, options: { ...stored.options, anchorId } } : stored;

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
