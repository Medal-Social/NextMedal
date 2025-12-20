import * as React from 'react';
import { cn } from '@/lib/utils';

const Empty = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'flex h-full w-full flex-col items-center justify-center rounded-lg border border-dashed p-14 text-center animate-in fade-in-50',
        className
      )}
      {...props}
    />
  )
);
Empty.displayName = 'Empty';

const EmptyHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('mb-8 flex flex-col items-center gap-2', className)} {...props} />
  )
);
EmptyHeader.displayName = 'EmptyHeader';

const EmptyMedia = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { variant?: 'default' | 'icon' }
>(({ className, variant = 'default', children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'mb-4 flex items-center justify-center',
      variant === 'icon' && 'h-12 w-12 rounded-lg bg-muted text-muted-foreground',
      className
    )}
    {...props}
  >
    {variant === 'icon' ? <div className="h-6 w-6">{children}</div> : children}
  </div>
));
EmptyMedia.displayName = 'EmptyMedia';

const EmptyTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn('text-xl font-bold tracking-tight', className)} {...props} />
  )
);
EmptyTitle.displayName = 'EmptyTitle';

const EmptyDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p ref={ref} className={cn('text-sm text-muted-foreground', className)} {...props} />
));
EmptyDescription.displayName = 'EmptyDescription';

const EmptyContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn('', className)} {...props} />
);
EmptyContent.displayName = 'EmptyContent';

export { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription, EmptyContent };
