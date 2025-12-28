import { ModuleRenderer } from './ModuleRenderer';
import type { ModuleContext } from './registry';

export type { ModuleContext };

type SidebarProps = {
  spacing?: 'default' | 'compact' | 'relaxed' | 'none';
  width?: 'default' | 'narrow' | 'wide' | 'full';
};

export default function Modules({
  modules,
  page,
  post,
  isSidebar = false,
}: {
  modules?: Sanity.Module[];
  page?: Sanity.Page | Sanity.ComponentLibrary;
  post?: Sanity.BlogPost;
  isSidebar?: boolean;
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
          />
        );
      })}
    </>
  );
}
