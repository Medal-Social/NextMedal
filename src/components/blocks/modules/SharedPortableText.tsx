import Link from 'next/link';
import { useLocale } from 'next-intl';
import {
  PortableText,
  type PortableTextBlock,
  type PortableTextBlockComponent,
  type PortableTextComponents,
  stegaClean,
} from 'next-sanity';
import { internalHref } from '@/lib/sanity/localized-link';
import { cn, slug } from '@/lib/utils/index';
import { validateExternalUrl } from '@/lib/validateExternalUrl';

// Rich-text anchors may be stored without the leading "#".
const anchorParams = (params?: string) => (params && !/^[#?]/.test(params) ? `#${params}` : params);

/** Rendered as its own component so it can read the visitor's language. */
function RichTextLink({ value, children }: { value?: Sanity.MenuItem; children: React.ReactNode }) {
  const { type, internal, external, params, newTab } = value || {};
  const locale = useLocale();
  // Final href (no /en/ prefix for English, so no 308) for a plain <a> / next/link.
  const internalUrl = internal?.metadata?.slug?.current
    ? internalHref(internal, locale, anchorParams(params))
    : undefined;

  if (type === 'external' || external) {
    // A link marked external that only holds an internal reference still goes there;
    // an unsafe external value (javascript:, data:) never becomes an href.
    const safeExternal = external ? validateExternalUrl(stegaClean(external)) : null;
    const href = safeExternal || internalUrl;
    if (!href) return <>{children}</>;
    return (
      <a
        href={href}
        target={newTab ? '_blank' : undefined}
        rel={newTab ? 'noopener noreferrer' : undefined}
        className="font-medium text-primary hover:underline"
      >
        {children}
      </a>
    );
  }

  if (!internalUrl) return <>{children}</>;

  return (
    <Link href={internalUrl} className="font-medium text-primary hover:underline">
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
    link: ({ children, value }) => <RichTextLink value={value}>{children}</RichTextLink>,
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

type BlockComponents = Exclude<PortableTextComponents['block'], PortableTextBlockComponent>;

/** A paragraph with no visible text (double Enter in the Studio). Non-breaking spaces count as text. */
function isEmptyBlock(block: PortableTextBlock): boolean {
  return (
    block.children?.every(
      (child) =>
        child?._type === 'span' &&
        stegaClean(String(child.text ?? '')).replace(/[ \t\r\n]+/g, '') === ''
    ) ?? false
  );
}

/** Wraps a paragraph renderer so an empty paragraph renders as one empty line in its own style. */
function emptyLineAware(Base: PortableTextBlockComponent): PortableTextBlockComponent {
  return function EmptyLineAwareParagraph(props) {
    if (!isEmptyBlock(props.value)) return <Base {...props} />;
    return (
      <Base {...props}>
        <br />
      </Base>
    );
  };
}

// Cached per base renderer so re-renders keep component identity (no paragraph remounts).
const emptyLineAwareCache = new WeakMap<PortableTextBlockComponent, PortableTextBlockComponent>();
const defaultParagraph = emptyLineAware(({ children }) => <p>{children}</p>);

function withEmptyLine(base?: PortableTextBlockComponent): PortableTextBlockComponent {
  if (!base) return defaultParagraph;
  let wrapped = emptyLineAwareCache.get(base);
  if (!wrapped) {
    wrapped = emptyLineAware(base);
    emptyLineAwareCache.set(base, wrapped);
  }
  return wrapped;
}

/** Every `normal` paragraph renders a double Enter as one empty line (lean schema rule 8). */
function withParagraphEmptyLines(
  block: PortableTextComponents['block']
): PortableTextComponents['block'] {
  // A single function override styles every block itself; leave it alone.
  if (typeof block === 'function') return block;
  const styles: BlockComponents = block ?? {};
  return { ...styles, normal: withEmptyLine(styles.normal) };
}

function mergePortableTextComponentMap<T>(defaults: T | undefined, overrides: T | undefined) {
  if (typeof defaults === 'function' || typeof overrides === 'function') {
    return overrides ?? defaults;
  }

  return {
    ...(defaults && typeof defaults === 'object' ? defaults : {}),
    ...(overrides && typeof overrides === 'object' ? overrides : {}),
  } as T;
}

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
  // @portabletext/react 7 types reject spread-merging component maps whose
  // values may be undefined — merge through the typed helper instead.
  const finalComponents = {
    ...selectedComponents,
    ...components,
    block: withParagraphEmptyLines(
      mergePortableTextComponentMap(selectedComponents.block, components?.block)
    ),
    marks: mergePortableTextComponentMap(selectedComponents.marks, components?.marks),
    types: mergePortableTextComponentMap(selectedComponents.types, components?.types),
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
