'use client';

import { Languages } from 'lucide-react';
import { useRouter as useNextRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { type ReactNode, useEffect, useState, useTransition } from 'react';
import { checkTranslationAvailability } from '@/app/actions/check-translation';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Spinner } from '@/components/ui/spinner';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils/index';

type Props = {
  children: ReactNode;
  defaultValue: string;
  label: string;
  translationUrls?: Record<string, string>;
  className?: string;
};

interface LocaleOption {
  value: string;
  label: string;
}

export default function LocaleSwitcherSelect({
  children,
  defaultValue,
  label,
  className,
  dropdownAlign = 'end',
}: Props & { dropdownAlign?: 'start' | 'end' | 'center' }) {
  const nextRouter = useNextRouter();
  const [isPending, startTransition] = useTransition();
  const t = useTranslations('Accessibility');

  // Extract options from children
  const options: LocaleOption[] = [];
  if (Array.isArray(children)) {
    for (const child of children) {
      if (child?.props?.value && child?.props?.children) {
        options.push({
          value: child.props.value,
          label: child.props.children,
        });
      }
    }
  }

  const [isOpen, setIsOpen] = useState(false);

  function onSelectLocale(nextLocale: string) {
    setIsOpen(false);
    startTransition(async () => {
      const pathname = window.location.pathname;

      // Check translation availability via server action
      const result = await checkTranslationAvailability(pathname, defaultValue, nextLocale);

      if (result.found && result.redirectUrl) {
        // Translation exists - auto-redirect
        nextRouter.push(result.redirectUrl);
      } else {
        // No translation - show dialog with available locales
        const localeLabel = options.find((opt) => opt.value === nextLocale)?.label || nextLocale;
        const request = {
          targetLocale: nextLocale,
          targetLocaleName: localeLabel,
          availableLocales: result.availableLocales, // NEW: Include available locales
          timestamp: Date.now(),
        };
        sessionStorage.setItem('translation-request', JSON.stringify(request));

        // Trigger dialog (dialog component will detect this custom event)
        window.dispatchEvent(new Event('translation-request'));
      }
    });
  }

  // Keyboard shortcut for language menu
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

      // Check for 'l' or 'L' key press without modifiers (except Shift)
      if (e.key.toLowerCase() === 'l' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <Tooltip>
        <TooltipTrigger
          render={
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-lg"
                  aria-label={label}
                  className={cn(
                    'hover:bg-accent/50',
                    isPending && 'opacity-60 pointer-events-none',
                    className
                  )}
                  disabled={isPending}
                >
                  {isPending ? <Spinner className="size-5" /> : <Languages className="size-5" />}
                </Button>
              }
            />
          }
        />
        {!isOpen && (
          <TooltipContent side="bottom" className="flex items-center gap-2">
            <span>{t('changeLanguage')}</span>
            <kbd className="pointer-events-none inline-flex h-4 select-none items-center gap-1 rounded border bg-muted px-1 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
              L
            </kbd>
          </TooltipContent>
        )}
      </Tooltip>

      <DropdownMenuContent
        className={cn(
          'w-40 z-[200] p-1.5',
          'backdrop-blur-xl bg-popover/95',
          'border-border/50',
          'shadow-xl shadow-black/10 dark:shadow-black/30',
          'rounded-xl'
        )}
        align={dropdownAlign}
        sideOffset={8}
      >
        <DropdownMenuRadioGroup value={defaultValue} onValueChange={onSelectLocale}>
          {options.map((option) => (
            <DropdownMenuRadioItem
              key={option.value}
              value={option.value}
              className={cn(
                'py-2 px-3 mx-0.5 rounded-lg cursor-pointer text-sm',
                'transition-colors duration-150',
                'hover:bg-accent/80',
                'data-[checked]:bg-primary/5 data-[checked]:text-primary data-[checked]:font-medium'
              )}
            >
              {option.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
