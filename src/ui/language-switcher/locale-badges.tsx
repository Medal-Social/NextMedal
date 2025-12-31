import { cn } from '@/lib/utils/index';

interface LocaleBadgeProps {
  locale: string;
  className?: string;
}

const LOCALE_LABELS: Record<string, string> = {
  en: 'EN',
  nb: 'NO',
};

export function LocaleBadge({ locale, className }: LocaleBadgeProps) {
  const label = LOCALE_LABELS[locale] || locale.toUpperCase().slice(0, 2);

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center',
        'h-5 min-w-5 px-1.5 rounded text-[10px] font-bold uppercase tracking-wide',
        'bg-muted text-muted-foreground',
        className
      )}
      aria-hidden="true"
    >
      {label}
    </span>
  );
}
