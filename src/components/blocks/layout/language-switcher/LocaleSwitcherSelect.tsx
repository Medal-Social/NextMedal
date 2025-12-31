'use client';

import { ChevronDown } from 'lucide-react';
import { useRouter as useNextRouter } from 'next/navigation';
import { type ReactNode, useTransition } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Spinner } from '@/components/ui/spinner';
import { routing } from '@/i18n/routing';
import { cn } from '@/lib/utils/index';
import { LocaleBadge } from './locale-badges';

type Props = {
  children: ReactNode;
  defaultValue: string;
  label: string;
  selectLanguageLabel: string;
  languageText: string;
  translationUrls?: Record<string, string>;
  className?: string;
  translationNotAvailable?: string;
  goToHome?: string;
};

interface LocaleOption {
  value: string;
  label: string;
}

export default function LocaleSwitcherSelect({
  children,
  defaultValue,
  label,
  selectLanguageLabel,
  translationUrls = {},
  className,
  dropdownAlign = 'end',
  translationNotAvailable = 'This page is not available in {locale}',
  goToHome = 'Go to {locale} home',
}: Props & { dropdownAlign?: 'start' | 'end' | 'center' }) {
  const nextRouter = useNextRouter();
  const [isPending, startTransition] = useTransition();

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

  function onSelectLocale(nextLocale: string) {
    startTransition(() => {
      // Use translated URL if available
      const translatedUrl = translationUrls[nextLocale];

      if (translatedUrl) {
        // Navigate directly to the translated URL using Next.js router
        nextRouter.push(translatedUrl);
      } else {
        // Show toast notification that translation doesn't exist
        const localeLabel = options.find((opt) => opt.value === nextLocale)?.label || nextLocale;
        const homeUrl = nextLocale === routing.defaultLocale ? '/' : `/${nextLocale}`;

        toast.info(translationNotAvailable.replace('{locale}', localeLabel), {
          action: {
            label: goToHome.replace('{locale}', localeLabel),
            onClick: () => nextRouter.push(homeUrl),
          },
        });
      }
    });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="outline"
            size="sm"
            aria-label={label}
            className={cn(
              'h-9 px-2.5 gap-1.5 group',
              'transition-all duration-200',
              'hover:bg-accent/50 hover:border-accent',
              isPending && 'opacity-60 pointer-events-none',
              className
            )}
            disabled={isPending}
          >
            {isPending ? <Spinner className="size-4" /> : <LocaleBadge locale={defaultValue} />}
            <ChevronDown className="size-3.5 opacity-60 transition-transform duration-200 group-data-[popup-open]:rotate-180" />
          </Button>
        }
      />
      <DropdownMenuContent
        className={cn(
          'w-48 z-[200] p-1.5',
          'backdrop-blur-xl bg-popover/95',
          'border-border/50',
          'shadow-xl shadow-black/10 dark:shadow-black/30',
          'rounded-xl'
        )}
        align={dropdownAlign}
        sideOffset={8}
      >
        <DropdownMenuGroup>
          <DropdownMenuLabel className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            {selectLanguageLabel}
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="mx-1.5" />
          <DropdownMenuRadioGroup value={defaultValue} onValueChange={onSelectLocale}>
            {options.map((option) => (
              <DropdownMenuRadioItem
                key={option.value}
                value={option.value}
                className={cn(
                  'py-2.5 px-3 mx-1 rounded-lg cursor-pointer',
                  'transition-colors duration-150',
                  'hover:bg-accent/80',
                  'data-[checked]:bg-primary/10 data-[checked]:font-medium'
                )}
              >
                <span className="flex items-center gap-3">
                  <LocaleBadge locale={option.value} />
                  <span>{option.label}</span>
                </span>
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
