'use client';

import { FileText, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import * as React from 'react';
import type { SearchResultItem } from '@/components/blocks/layout/header/types';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { logger } from '@/lib/core/logger';
import { cn } from '@/lib/utils/index';

interface CommandMenuProps {
  variant?: 'default' | 'mobile' | 'icon';
  className?: string;
}

export function CommandMenu({ variant = 'default', className }: CommandMenuProps) {
  const [open, setOpen] = React.useState(false);
  const [items, setItems] = React.useState<SearchResultItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const router = useRouter();
  const locale = useLocale(); // Get current locale from next-intl
  const t = useTranslations('search');
  const tA11y = useTranslations('Accessibility');

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
      setIsLoading(true);
      try {
        const res = await fetch(`/api/search?locale=${locale}`, { signal });
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

    fetchItems();

    return () => {
      document.removeEventListener('keydown', down);
      controller.abort();
    };
  }, [locale]);

  const runCommand = React.useCallback((command: () => unknown) => {
    setOpen(false);
    command();
  }, []);

  return (
    <>
      <Tooltip>
        <TooltipTrigger
          render={
            <button
              type="button"
              onClick={() => setOpen(true)}
              className={cn(
                variant === 'default' && [
                  'inline-flex h-9 items-center justify-between rounded-md border border-input border-solid bg-transparent px-3 py-2 text-sm shadow-sm',
                  'ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring',
                  'w-full text-muted-foreground transition-colors hover:bg-muted/50 disabled:cursor-not-allowed disabled:opacity-50 md:w-[200px] lg:w-[240px]',
                ],
                variant === 'mobile' && [
                  'flex h-14 items-center gap-4 rounded-lg p-4 font-medium text-foreground text-lg transition-colors hover:bg-accent hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary',
                ],
                variant === 'icon' && [
                  'inline-flex h-10 w-10 items-center justify-center rounded-md text-foreground outline-none transition-colors hover:bg-accent/50',
                ],
                className
              )}
              aria-label={tA11y('openSearch')}
            >
              <span className="flex items-center gap-2">
                <Search
                  className={cn(variant === 'default' || variant === 'icon' ? 'size-5' : 'h-5 w-5')}
                />
                {variant === 'default' && (
                  <>
                    <span className="hidden lg:inline">{t('placeholder')}</span>
                    <span className="inline lg:hidden">{t('placeholder').replace('...', '')}</span>
                  </>
                )}
                {variant === 'mobile' && <span>{t('placeholder').replace('...', '')}</span>}
              </span>
              {variant === 'default' && (
                <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-medium font-mono text-[10px] text-muted-foreground opacity-100 lg:inline-flex">
                  <span className="text-xs">⌘</span>K
                </kbd>
              )}
            </button>
          }
        />
        <TooltipContent side="bottom" className="flex items-center gap-2">
          <span>{tA11y('openSearch')}</span>
          <kbd className="pointer-events-none inline-flex h-4 select-none items-center gap-1 rounded border bg-muted px-1 font-medium font-mono text-[10px] text-muted-foreground opacity-100">
            ⌘K
          </kbd>
        </TooltipContent>
      </Tooltip>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder={t('commandPlaceholder')} />
        <CommandList>
          <CommandEmpty>{t('noResults')}</CommandEmpty>

          {isLoading ? (
            <div className="space-y-3 p-4">
              <div className="h-4 w-20 animate-pulse rounded bg-muted" />
              <div className="h-8 w-full animate-pulse rounded bg-muted" />
              <div className="h-8 w-full animate-pulse rounded bg-muted" />
              <div className="mt-4 h-4 w-16 animate-pulse rounded bg-muted" />
              <div className="h-8 w-full animate-pulse rounded bg-muted" />
            </div>
          ) : (
            <>
              {items.filter((item) => item.type === 'Articles').length > 0 && (
                <CommandGroup heading={t('categories.articles')}>
                  {items
                    .filter((item) => item.type === 'Articles')
                    .map((item) => (
                      <CommandItem
                        key={item._id}
                        value={item.title}
                        onSelect={() => runCommand(() => router.push(item.href))}
                      >
                        <FileText className="mr-2 h-4 w-4" />
                        <span>{item.title}</span>
                      </CommandItem>
                    ))}
                </CommandGroup>
              )}

              {items.filter((item) => item.type === 'Docs').length > 0 && (
                <>
                  <CommandSeparator />
                  <CommandGroup heading={t('categories.documentation')}>
                    {items
                      .filter((item) => item.type === 'Docs')
                      .map((item) => (
                        <CommandItem
                          key={item._id}
                          value={item.title}
                          onSelect={() => runCommand(() => router.push(item.href))}
                        >
                          <FileText className="mr-2 h-4 w-4" />
                          <span>{item.title}</span>
                        </CommandItem>
                      ))}
                  </CommandGroup>
                </>
              )}

              {items.filter((item) => item.type === 'Changelog').length > 0 && (
                <>
                  <CommandSeparator />
                  <CommandGroup heading={t('categories.changelog')}>
                    {items
                      .filter((item) => item.type === 'Changelog')
                      .map((item) => (
                        <CommandItem
                          key={item._id}
                          value={item.title}
                          onSelect={() => runCommand(() => router.push(item.href))}
                        >
                          <FileText className="mr-2 h-4 w-4" />
                          <span>{item.title}</span>
                        </CommandItem>
                      ))}
                  </CommandGroup>
                </>
              )}

              {items.filter((item) => item.type === 'Newsletter').length > 0 && (
                <>
                  <CommandSeparator />
                  <CommandGroup heading={t('categories.newsletter')}>
                    {items
                      .filter((item) => item.type === 'Newsletter')
                      .map((item) => (
                        <CommandItem
                          key={item._id}
                          value={item.title}
                          onSelect={() => runCommand(() => router.push(item.href))}
                        >
                          <FileText className="mr-2 h-4 w-4" />
                          <span>{item.title}</span>
                        </CommandItem>
                      ))}
                  </CommandGroup>
                </>
              )}

              {items.filter((item) => item.type === 'Page').length > 0 && (
                <>
                  <CommandSeparator />
                  <CommandGroup heading={t('categories.pages')}>
                    {items
                      .filter((item) => item.type === 'Page')
                      .map((item) => (
                        <CommandItem
                          key={item._id}
                          value={item.title}
                          onSelect={() => runCommand(() => router.push(item.href))}
                        >
                          <FileText className="mr-2 h-4 w-4" />
                          <span>{item.title}</span>
                        </CommandItem>
                      ))}
                  </CommandGroup>
                </>
              )}
            </>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}
