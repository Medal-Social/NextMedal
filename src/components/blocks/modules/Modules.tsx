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

  return (
    <>
      {modules.map((module) => {
        if (!module) return null;

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
