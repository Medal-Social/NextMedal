import { useLocale } from 'next-intl';
import { PortableText, type PortableTextComponents, stegaClean } from 'next-sanity';
import { Link } from '@/i18n/navigation';
import { internalLink } from '@/lib/sanity/localized-link';
import { cn, slug } from '@/lib/utils/index';

// Rich-text anchors may be stored without the leading "#".
const anchorParams = (params?: string) => (params && !/^[#?]/.test(params) ? `#${params}` : params);

function InternalRichTextLink({
  internal,
  params,
  children,
}: {
  internal: Sanity.MenuItem['internal'];
  params?: string;
  children: React.ReactNode;
}) {
  const link = internalLink(internal, useLocale(), anchorParams(params));
  if (!link) return <>{children}</>;
  return (
    <Link
      href={link.href}
      locale={link.locale}
      className="font-medium text-primary hover:underline"
    >
      {children}
    </Link>
  );
}

interface SharedPortableTextProps {
  value: Sanity.BlockContent | undefined | null;
  className?: string;
  components?: PortableTextComponents;
  variant?: 'default' | 'prose' | 'intro';
}

const defaultComponents: PortableTextComponents = {
  marks: {
    // Italic is italic everywhere (Vault spec 2026-10-18 bug 3).
    em: ({ children }) => <em>{children}</em>,
    link: ({ children, value }) => {
      const { type, internal, external, params, newTab } = value || {};

      if (type === 'external' || external) {
        if (!external) return <>{children}</>;
        return (
          <a
            href={external}
            target={newTab ? '_blank' : undefined}
            rel={newTab ? 'noopener noreferrer' : undefined}
            className="font-medium text-primary hover:underline"
          >
            {children}
          </a>
        );
      }

      if (!internal?.metadata?.slug?.current) return <>{children}</>;

      return (
        <InternalRichTextLink internal={internal} params={params}>
          {children}
        </InternalRichTextLink>
      );
    },
  },
};

const introComponents: PortableTextComponents = {
  ...defaultComponents,
  block: {
    h2: ({ children }) => (
      <h2 className="mb-6 font-extrabold text-4xl text-foreground leading-[1.1] tracking-tight md:text-5xl lg:text-7xl">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="mt-8 mb-4 font-bold text-2xl text-foreground tracking-tight md:text-3xl">
        {children}
      </h3>
    ),
    normal: ({ children }) => (
      <p className="mx-auto max-w-2xl font-normal text-lg text-muted-foreground md:text-xl">
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

  // Merge custom components if provided.
  // `block` is always the record/object-map form in this file (never the function
  // form), but @portabletext/react v6.2 types it as `function | record`, so the
  // spread result needs an assertion back to PortableTextComponents.
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
  } as PortableTextComponents;

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
