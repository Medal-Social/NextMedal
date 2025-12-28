import { type ModuleContext, moduleRegistry } from './registry.config';

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

        const config = moduleRegistry[module._type];
        if (!config) {
          return <div data-type={module._type} key={module._key} />;
        }

        const Component = config.component;
        const props = config.getProps ? config.getProps(module, context) : module;

        return <Component {...props} key={module._key} {...sidebarProps} />;
      })}
    </>
  );
}
