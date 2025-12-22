import { PortableText, type PortableTextComponents, stegaClean } from 'next-sanity';
import { cn, slug } from '@/lib/utils';

interface SharedPortableTextProps {
  value: any;
  className?: string;
  components?: PortableTextComponents;
  variant?: 'default' | 'prose' | 'intro';
}

const defaultComponents: PortableTextComponents = {
  marks: {
    em: ({ children }) => <span className="text-primary font-bold">{children}</span>,
  },
};

const introComponents: PortableTextComponents = {
  ...defaultComponents,
  block: {
    h2: ({ children }) => (
      <h2 className="text-4xl md:text-5xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] text-foreground mb-6">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground mb-4 mt-8">
        {children}
      </h3>
    ),
    normal: ({ children }) => (
      <p className="text-lg md:text-xl text-muted-foreground font-normal max-w-2xl mx-auto">
        {children}
      </p>
    ),
  },
};

const createProseComponents = (customTypes?: any): PortableTextComponents => ({
  ...defaultComponents,
  types: customTypes || {},
  block: {
    h2: ({ children, value }: any) => {
      const id = slug(stegaClean(value.children?.map((child: any) => child.text).join('') || ''));
      return (
        <h2 id={id} className="scroll-mt-24">
          {children}
        </h2>
      );
    },
    h3: ({ children, value }: any) => {
      const id = slug(stegaClean(value.children?.map((child: any) => child.text).join('') || ''));
      return (
        <h3 id={id} className="scroll-mt-24">
          {children}
        </h3>
      );
    },
  },
});

export default function SharedPortableText({
  value,
  className,
  components,
  variant = 'default',
}: SharedPortableTextProps) {
  if (!value) return null;

  let selectedComponents = defaultComponents;
  if (variant === 'intro') selectedComponents = introComponents;
  if (variant === 'prose') selectedComponents = createProseComponents(components?.types);

  // Merge custom components if provided
  const finalComponents = {
    ...selectedComponents,
    ...components,
    block: {
      ...selectedComponents.block,
      ...components?.block,
    },
    marks: {
      ...selectedComponents.marks,
      ...components?.marks,
    },
    types: {
      ...selectedComponents.types,
      ...components?.types,
    },
  };

  return (
    <div
      className={cn(
        variant === 'prose' && 'prose prose-slate dark:prose-invert max-w-none',
        className
      )}
    >
      <PortableText value={value} components={finalComponents} />
    </div>
  );
}
