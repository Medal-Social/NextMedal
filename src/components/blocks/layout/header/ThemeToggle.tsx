'use client';

import { Moon, Sun } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils/index';

export default function HeaderThemeToggle({ className }: { className?: string }) {
  const [mounted, setMounted] = useState(false);
  const { setTheme, resolvedTheme } = useTheme();
  const t = useTranslations('Accessibility');

  // useEffect only runs on the client, so now we can safely show the UI
  useEffect(() => {
    setMounted(true);
  }, []);

  // Define toggleTheme BEFORE keyboard effect (needed as dependency)
  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

  // Keyboard shortcut handler - 'D' key to toggle theme
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input, textarea, or contentEditable element
      const target = e.target as HTMLElement;
      if (
        target.isContentEditable ||
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT'
      ) {
        return;
      }

      // Check for 'd' or 'D' key press without modifiers (except Shift)
      if (e.key.toLowerCase() === 'd' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        toggleTheme();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [resolvedTheme, setTheme]);

  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon-lg"
        disabled
        aria-label={t('toggleTheme')}
        className={cn('opacity-50', className)}
      >
        <Sun className="size-5" />
      </Button>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            size="icon-lg"
            variant="ghost"
            onClick={toggleTheme}
            aria-label={t('toggleTheme')}
            className={cn('hover:bg-accent/50', className)}
          >
            <Sun className="size-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute size-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">{t('toggleTheme')}</span>
          </Button>
        }
      />
      <TooltipContent side="bottom" className="flex items-center gap-2">
        <span>{t('toggleTheme')}</span>
        <kbd className="pointer-events-none inline-flex h-4 select-none items-center gap-1 rounded border bg-muted px-1 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
          D
        </kbd>
      </TooltipContent>
    </Tooltip>
  );
}
