import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { stegaClean } from 'next-sanity';

export default function Pretitle({ className, children }: React.ComponentProps<'p'>) {
  if (!children) return null;

  return (
    <Badge
      variant="outline"
      className={cn('border-border font-medium text-sm py-0.5 px-3 rounded-full', className)}
    >
      {stegaClean(children)}
    </Badge>
  );
}
