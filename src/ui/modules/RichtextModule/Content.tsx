import { PortableText } from 'next-sanity';
import { cn } from '@/lib/utils';
import Image from './Image';

export default function Content({
  value,
  className,
  children,
}: { value: any } & React.ComponentProps<'div'>) {
  return (
    <div className={cn('prose prose-slate dark:prose-invert max-w-none', className)}>
      <PortableText
        value={value}
        components={{
          types: {
            image: Image,
          },
        }}
      />

      {children}
    </div>
  );
}
