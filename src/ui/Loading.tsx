import { cn } from '@/lib/utils';
import type { ComponentProps } from 'react';
import { VscLoading } from 'react-icons/vsc';

export default function Loading({ className, children }: ComponentProps<'div'>) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <VscLoading className="animate-spin" />
      {children || 'Loading...'}
    </div>
  );
}
