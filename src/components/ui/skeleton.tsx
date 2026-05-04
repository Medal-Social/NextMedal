import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils/index';

// Vendored from @medalsocial/meda primitives (Apache 2.0). Adds aria-hidden
// by default so loading placeholders don't leak into screen readers.

export type SkeletonProps = ComponentProps<'div'>;

function Skeleton({ className, 'aria-hidden': ariaHidden = true, ...props }: SkeletonProps) {
  return (
    <div
      data-slot="skeleton"
      aria-hidden={ariaHidden}
      className={cn('animate-pulse rounded-md bg-muted', className)}
      {...props}
    />
  );
}

export { Skeleton };
