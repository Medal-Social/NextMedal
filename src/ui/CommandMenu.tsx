'use client';

import { FileText, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import * as React from 'react';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { cn } from '@/lib/utils';

export function CommandMenu() {
  const [open, setOpen] = React.useState(false);
  const [items, setItems] = React.useState<any[]>([]);
  const router = useRouter();

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener('keydown', down);

    const controller = new AbortController();
    const { signal } = controller;

    async function fetchItems() {
      try {
        const res = await fetch('/api/search', { signal });
        if (!res.ok) throw new Error('Failed to fetch search items');
        const data = await res.json();
        setItems(data);
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          return;
        }
        console.error('Search fetch error:', error);
        setItems([]);
      }
    }

    fetchItems();

    return () => {
      document.removeEventListener('keydown', down);
      controller.abort();
    };
  }, []);

  const runCommand = React.useCallback((command: () => unknown) => {
    setOpen(false);
    command();
  }, []);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          'inline-flex h-9 items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm',
          'ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring',
          'disabled:cursor-not-allowed disabled:opacity-50 w-full md:w-[200px] lg:w-[240px] text-muted-foreground hover:bg-muted/50 transition-colors'
        )}
      >
        <span className="flex items-center gap-2">
          <Search className="h-4 w-4" />
          <span className="hidden lg:inline">Search...</span>
          <span className="inline lg:hidden">Search</span>
        </span>
        <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>

          <CommandGroup heading="Blog Posts">
            {items
              .filter((i) => i.type === 'Blog')
              .map((item) => (
                <CommandItem
                  key={item._id}
                  value={item._id}
                  keywords={[item.title]}
                  onSelect={() => runCommand(() => router.push(item.href))}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    runCommand(() => router.push(item.href));
                  }}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  <span>{item.title}</span>
                </CommandItem>
              ))}
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Pages">
            {items
              .filter((i) => i.type === 'Page')
              .map((item) => (
                <CommandItem
                  key={item._id}
                  value={item._id}
                  keywords={[item.title]}
                  onSelect={() => runCommand(() => router.push(item.href))}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    runCommand(() => router.push(item.href));
                  }}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  <span>{item.title}</span>
                </CommandItem>
              ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
