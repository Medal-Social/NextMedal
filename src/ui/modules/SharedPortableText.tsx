import Link from 'next/link';
import { PortableText, type PortableTextComponents, stegaClean } from 'next-sanity';
import { cn, slug } from '@/lib/utils/index';
import resolveSlug from '@/sanity/lib/resolveSlug';

interface SharedPortableTextProps {
  value: Sanity.BlockContent | undefined | null;
  className?: string;
  components?: PortableTextComponents;
  variant?: 'default' | 'prose' | 'intro';
}

const defaultComponents: PortableTextComponents = {
  marks: {
    em: ({ children }) => <span className="text-primary font-bold">{children}</span>,
    link: ({ children, value }) => {
      const { type, internal, external, params, newTab } = value || {};
      const href = resolveSlug({
        _type: internal?._type,
        internal: internal?.metadata?.slug?.current,
        external,
        params,
      });

      if (!href) return <>{children}</>;

      if (type === 'external' || external) {
        return (
          <a
            href={href}
            target={newTab ? '_blank' : undefined}
            rel={newTab ? 'noopener noreferrer' : undefined}
            className="text-primary hover:underline font-medium"
          >
            {children}
          </a>
        );
      }

      return (
        <Link href={href} className="text-primary hover:underline font-medium">
          {children}
        </Link>
      );
    },
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

// Helper to extract text from Portable Text block children
const getBlockText = (value: { children?: unknown[] }): string => {
  if (!value.children) return '';
  return value.children
    .map((child) =>
      child && typeof child === 'object' && 'text' in child ? String(child.text) : ''
    )
    .join('');
};

const createProseComponents = (
  customTypes?: PortableTextComponents['types']
): PortableTextComponents => ({
  ...defaultComponents,
  types: customTypes || {},
  block: {
    h2: ({ children, value }) => {
      const id = slug(stegaClean(getBlockText(value)));
      return (
        <h2 id={id} className="scroll-mt-24">
          {children}
        </h2>
      );
    },
    h3: ({ children, value }) => {
      const id = slug(stegaClean(getBlockText(value)));
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
