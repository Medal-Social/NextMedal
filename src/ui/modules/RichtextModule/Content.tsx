import { PortableText, type PortableTextComponents } from 'next-sanity';
import { cn, slug } from '@/lib/utils';
import Image from './Image';

const components: PortableTextComponents = {
  types: {
    image: Image,
  },
  block: {
    h2: ({ children, value }: any) => {
      const id = slug(value.children?.map((child: any) => child.text).join('') || '');
      return (
        <h2 id={id} className="scroll-mt-24">
          {children}
        </h2>
      );
    },
    h3: ({ children, value }: any) => {
      const id = slug(value.children?.map((child: any) => child.text).join('') || '');
      return (
        <h3 id={id} className="scroll-mt-24">
          {children}
        </h3>
      );
    },
  },
};

export default function Content({
  value,
  className,
  children,
}: { value: any } & React.ComponentProps<'div'>) {
  return (
    <div className={cn('prose prose-slate dark:prose-invert max-w-none', className)}>
      <PortableText value={value} components={components} />

      {children}
    </div>
  );
}
