'use client';

import { FileText, Search, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { logger } from '@/lib/logger';
import { cn } from '@/lib/utils';
import type { SearchResultItem } from './types';

interface MobileSearchProps {
  className?: string;
}

export function MobileSearch({ className }: MobileSearchProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [items, setItems] = useState<SearchResultItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Fetch search items on mount
  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    async function fetchItems() {
      setIsLoading(true);
      try {
        const res = await fetch('/api/search', { signal });
        if (!res.ok) throw new Error('Failed to fetch search items');
        const data = await res.json();
        setItems(data);
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          return;
        }
        logger.error({ err: error }, 'Search fetch error:');
        setItems([]);
      } finally {
        setIsLoading(false);
      }
    }

    if (open) {
      fetchItems();
    }

    return () => controller.abort();
  }, [open]);

  // Focus input when dialog opens
  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  const filteredItems = items.filter(
    (item) => query.length === 0 || item.title.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = useCallback(
    (href: string) => {
      setOpen(false);
      setQuery('');
      router.push(href);
    },
    [router]
  );

  const blogPosts = filteredItems.filter((i) => i.type === 'Blog');
  const pages = filteredItems.filter((i) => i.type === 'Page');

  return (
    <>
      <Button
        variant="ghost"
        onClick={() => setOpen(true)}
        className={cn(
          'flex items-center gap-4 rounded-lg p-4 text-lg font-medium hover:bg-accent hover:text-primary text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-colors h-14',
          className
        )}
        aria-label="Open search"
      >
        <Search className="h-5 w-5" />
        <span>Search</span>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="top-0 translate-y-0 sm:top-[10%] sm:translate-y-0 max-w-lg p-0 gap-0">
          <DialogTitle className="sr-only">Search</DialogTitle>
          <div className="flex items-center border-b px-4 py-3">
            <Search className="h-5 w-5 text-muted-foreground mr-3 shrink-0" />
            <Input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search..."
              className="border-0 shadow-none focus-visible:ring-0 px-0 text-base"
              aria-label="Search input"
            />
            {query && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setQuery('')}
                className="shrink-0 h-8 w-8"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          <div className="max-h-[60vh] overflow-y-auto p-2">
            {isLoading ? (
              <div className="py-8 text-center text-muted-foreground">Loading...</div>
            ) : filteredItems.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">No results found.</div>
            ) : (
              <>
                {blogPosts.length > 0 && (
                  <div className="mb-4">
                    <h3 className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Blog Posts
                    </h3>
                    <ul className="space-y-1">
                      {blogPosts.map((item) => (
                        <li key={item._id}>
                          <button
                            type="button"
                            onClick={() => handleSelect(item.href)}
                            className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm hover:bg-accent focus:bg-accent focus:outline-none transition-colors"
                          >
                            <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                            <span className="truncate">{item.title}</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {pages.length > 0 && (
                  <div>
                    <h3 className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Pages
                    </h3>
                    <ul className="space-y-1">
                      {pages.map((item) => (
                        <li key={item._id}>
                          <button
                            type="button"
                            onClick={() => handleSelect(item.href)}
                            className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm hover:bg-accent focus:bg-accent focus:outline-none transition-colors"
                          >
                            <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                            <span className="truncate">{item.title}</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
