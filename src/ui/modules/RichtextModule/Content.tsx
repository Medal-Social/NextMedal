import { cn } from '@/lib/utils';
import { PortableText } from 'next-sanity';
import Admonition from './Admonition';
import AnchoredHeading from './AnchoredHeading';
import Image from './Image';

export default function Content({
  value,
  className,
  children,
}: { value: any } & React.ComponentProps<'div'>) {
  return (
    <div className={cn('richtext mx-auto', className)}>
      <PortableText
        value={value}
        components={{
          block: {
            h2: (node) => <AnchoredHeading as="h2" {...node} />,
            h3: (node) => <AnchoredHeading as="h3" {...node} />,
            h4: (node) => <AnchoredHeading as="h4" {...node} />,
            h5: (node) => <AnchoredHeading as="h5" {...node} />,
            h6: (node) => <AnchoredHeading as="h6" {...node} />,
          },
          types: {
            image: Image,
            admonition: Admonition
          },
        }}
      />

      {children}
    </div>
  );
}
