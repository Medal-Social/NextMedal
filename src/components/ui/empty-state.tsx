import type { LucideIcon } from 'lucide-react';
import { type ComponentPropsWithoutRef, isValidElement, type ReactNode } from 'react';
import { cn } from '@/lib/utils/index';

// Vendored from @medalsocial/meda primitives (Apache 2.0). Sourced from
// https://github.com/Medal-Social/meda/blob/main/src/primitives/empty-state.tsx
// Once meda ships per-surface optional peer deps + a top-level
// ./primitives export entry, swap this file for:
//   import { EmptyState } from '@medalsocial/meda/primitives';

export type EmptyStateVariant = 'default' | 'panel' | 'inline';

export interface EmptyStateProps extends Omit<ComponentPropsWithoutRef<'div'>, 'title'> {
  icon?: LucideIcon | ReactNode;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  variant?: EmptyStateVariant;
}

function isIconComponent(icon: NonNullable<EmptyStateProps['icon']>): icon is LucideIcon {
  if (typeof icon === 'function') return true;
  if (typeof icon !== 'object') return false;
  return '$$typeof' in icon && !isValidElement(icon);
}

function renderIcon(icon: EmptyStateProps['icon']) {
  if (!icon) return null;
  if (isIconComponent(icon)) {
    const Icon = icon;
    return <Icon data-testid="empty-state-icon" className="size-10" aria-hidden="true" />;
  }
  return (
    <span data-testid="empty-state-icon" aria-hidden="true" className="inline-flex">
      {icon}
    </span>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  variant = 'default',
  className,
  ...props
}: EmptyStateProps) {
  return (
    <div
      data-slot="empty-state"
      data-variant={variant}
      className={cn(
        'flex flex-col items-center justify-center text-center',
        variant === 'default' && 'px-6 py-16',
        variant === 'panel' && 'px-4 py-10',
        variant === 'inline' && 'px-3 py-6',
        className
      )}
      {...props}
    >
      {icon ? (
        <div
          data-slot="empty-state-icon"
          className={cn(
            'mb-4 inline-flex items-center justify-center rounded-md text-muted-foreground',
            variant === 'inline' ? 'size-9' : 'size-12'
          )}
        >
          {renderIcon(icon)}
        </div>
      ) : null}
      <h3
        data-slot="empty-state-title"
        className={cn(
          'font-semibold text-foreground',
          variant === 'default' && 'text-lg',
          variant === 'panel' && 'text-base',
          variant === 'inline' && 'text-sm'
        )}
      >
        {title}
      </h3>
      {description ? (
        <p
          data-slot="empty-state-description"
          className={cn(
            'mt-1 max-w-sm text-muted-foreground',
            variant === 'inline' ? 'text-xs' : 'text-sm'
          )}
        >
          {description}
        </p>
      ) : null}
      {action ? (
        <div data-slot="empty-state-action" className="mt-5">
          {action}
        </div>
      ) : null}
    </div>
  );
}
