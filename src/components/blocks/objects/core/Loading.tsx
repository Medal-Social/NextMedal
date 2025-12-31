import { Loader2 } from 'lucide-react';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils/index';

export default function Loading({ className, children }: ComponentProps<'div'>) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Loader2 className="animate-spin" />
      {children || 'Loading...'}
    </div>
  );
}
