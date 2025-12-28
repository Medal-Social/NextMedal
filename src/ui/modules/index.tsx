import { Suspense } from 'react';
import { type ModuleContext, moduleRegistry } from './registry.config';

type SidebarProps = {
  spacing?: 'default' | 'compact' | 'relaxed' | 'none';
  width?: 'default' | 'narrow' | 'wide' | 'full';
};

// Modules that benefit from Suspense streaming (heavy/async content)
const SUSPENSE_MODULES = new Set([
  'blog-frontpage',
  'latest-articles',
  'component-gallery',
  'pricing-list',
  'team',
  'contact',
]);

// Loading skeleton for modules during streaming
function ModuleSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-64 bg-muted rounded-lg" />
    </div>
  );
}

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

        // Wrap heavy modules in Suspense for streaming
        if (SUSPENSE_MODULES.has(module._type)) {
          return (
            <Suspense key={module._key} fallback={<ModuleSkeleton />}>
              <Component {...props} {...sidebarProps} />
            </Suspense>
          );
        }

        return <Component {...props} key={module._key} {...sidebarProps} />;
      })}
    </>
  );
}
