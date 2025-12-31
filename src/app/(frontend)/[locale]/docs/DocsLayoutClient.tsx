'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import * as React from 'react';
import { DocsSidebar } from '@/components/blocks/docs/DocsSidebar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/index';

interface DocsLayoutClientProps {
  children: React.ReactNode;
}

export default function DocsLayoutClient({ children }: DocsLayoutClientProps) {
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        setIsCollapsed((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div
      className="w-full h-full flex-1 items-start md:grid md:gap-6 lg:gap-10 px-4 sm:px-6 lg:px-8 transition-all duration-300 ease-in-out"
      style={{
        gridTemplateColumns: isCollapsed ? '48px minmax(0,1fr)' : '240px minmax(0,1fr)',
      }}
    >
      <div
        className={cn(
          'fixed top-[var(--header-height)] z-30 hidden h-[calc(100vh-var(--header-height))] w-full shrink-0 md:sticky md:block border-r transition-all duration-300 ease-in-out pr-2',
          isCollapsed ? 'w-[48px]' : 'w-[240px] pr-4',
          !isCollapsed && 'lg:w-[280px]'
        )}
        style={{
          width: isCollapsed ? '48px' : undefined,
        }}
      >
        <div className="relative h-full flex flex-col">
          <div className={cn('flex-1 overflow-hidden', isCollapsed && 'opacity-0 invisible')}>
            <DocsSidebar className="h-full py-6 pr-2 lg:py-8" />
          </div>

          <Button
            variant="outline"
            size="icon-sm"
            className={cn(
              'absolute -right-3 top-8 z-50 h-8 w-8 rounded-full bg-background shadow-xs hover:bg-accent',
              'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary',
              isCollapsed && '-right-6'
            )}
            onClick={() => setIsCollapsed(!isCollapsed)}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
          </Button>

          {isCollapsed && (
            <div className="absolute inset-0 pt-6 flex flex-col items-center gap-4">
              <span className="sr-only">Sidebar collapsed</span>
            </div>
          )}
        </div>
      </div>
      <main className="relative py-6 lg:gap-10 lg:py-8 pl-2 md:pl-0">{children}</main>
    </div>
  );
}
