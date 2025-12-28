'use client';

import { FlaskConicalOff, Loader2 } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useTransition } from 'react';
import { cn } from '@/lib/utils';

export default function DraftModeControls() {
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();

  const disable = () =>
    startTransition(() => {
      window.location.href = `/api/draft-mode/disable?slug=${pathname}`;
    });

  return (
    <div className="fixed left-4 bottom-4 z-[60] animate-in fade-in slide-in-from-left-4 duration-300 motion-reduce:animate-none">
      <button
        type="button"
        onClick={disable}
        disabled={pending}
        className={cn(
          // Layout
          'flex items-center gap-2.5 px-4 py-2.5 rounded-full',
          // Glassmorphism
          'bg-white/70 backdrop-blur-md border border-white/30',
          'dark:bg-brand-900/60 dark:border-white/10',
          // Shadow
          'shadow-lg shadow-brand-vibrant/15 dark:shadow-brand-vibrant/25',
          // Typography
          'text-sm font-medium',
          'text-brand-vibrant dark:text-white',
          // Hover/active states with CSS transitions
          'hover:bg-white/85 dark:hover:bg-brand-800/70',
          'hover:scale-[1.02] active:scale-[0.98]',
          'transition-all duration-200 ease-out',
          'motion-reduce:transform-none',
          // Focus states
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-vibrant focus-visible:ring-offset-2',
          // Disabled state
          'disabled:opacity-70 disabled:cursor-not-allowed'
        )}
        aria-label={pending ? 'Disabling draft mode...' : 'Exit draft mode'}
      >
        {pending ? (
          <Loader2 className="size-4 shrink-0 animate-spin" />
        ) : (
          <FlaskConicalOff className="size-4 shrink-0" />
        )}
        <span>Draft Mode</span>
        <span
          className={cn(
            'text-xs px-2 py-0.5 rounded-full',
            'bg-brand-vibrant/10 dark:bg-white/10',
            'text-brand-vibrant dark:text-white/90'
          )}
        >
          {pending ? 'Exiting...' : 'Exit'}
        </span>
      </button>
    </div>
  );
}
