import { cn } from '@/lib/utils';
import { PortableText } from 'next-sanity';
import Admonition from './Admonition';
import Image from './Image';

export default function Content({
  value,
  className,
  children,
}: { value: any } & React.ComponentProps<'div'>) {
  return (
    <div className={cn('prose', className)}>
      <PortableText
        value={value}
        components={{
          types: {
            image: Image,
            admonition: Admonition,
          },
        }}
      />

      {children}
    </div>
  );
}
