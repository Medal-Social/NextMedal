'use client';

import { Languages } from 'lucide-react';
import { useRouter as useNextRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
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
import { routing } from '@/i18n/routing';
import { cn } from '@/lib/utils';

type Props = {
  children: ReactNode;
  defaultValue: string;
  label: string;
  selectLanguageLabel: string;
  languageText: string;
  translationUrls?: Record<string, string>;
  className?: string;
};

interface LocaleOption {
  value: string;
  label: string;
}

const FLAGS: Record<string, string> = {
  en: '🇺🇸',
  nb: '🇳🇴',
  // Add more flags as needed
};

export default function LocaleSwitcherSelect({
  children,
  defaultValue,
  label,
  selectLanguageLabel,
  languageText,
  translationUrls = {},
  className,
  dropdownAlign = 'end',
}: Props & { dropdownAlign?: 'start' | 'end' | 'center' }) {
  const nextRouter = useNextRouter();
  const [isPending, startTransition] = useTransition();
  const t = useTranslations('LocaleSwitcher');

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

        toast.info(t('translationNotAvailable', { locale: localeLabel }), {
          action: {
            label: t('goToHome', { locale: localeLabel }),
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
            variant="ghost"
            size="sm"
            aria-label={label}
            className={cn('h-8 px-2 gap-2', isPending && 'opacity-50', className)}
            disabled={isPending}
          >
            <Languages className="h-4 w-4" />
            <span className="hidden sm:inline-block text-sm font-medium">{languageText}</span>
          </Button>
        }
      />
      <DropdownMenuContent className="w-48 z-[200]" align={dropdownAlign}>
        <DropdownMenuGroup>
          <DropdownMenuLabel>{selectLanguageLabel}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuRadioGroup value={defaultValue} onValueChange={onSelectLocale}>
            {options.map((option) => (
              <DropdownMenuRadioItem key={option.value} value={option.value}>
                <span className="flex items-center gap-2">
                  <span>{FLAGS[option.value] || '🏳️'}</span>
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
