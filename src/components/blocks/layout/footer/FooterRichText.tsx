import type { PortableTextComponents } from 'next-sanity';
import SharedPortableText, { RichTextLink } from '@/components/blocks/modules/SharedPortableText';

/** Footer links keep the footer's muted look: underlined, darker on hover. */
const footerComponents: PortableTextComponents = {
  marks: {
    link: ({ children, value }) => (
      <RichTextLink value={value} className="underline transition-colors hover:text-foreground">
        {children}
      </RichTextLink>
    ),
  },
};

/**
 * Footer tagline and copyright (rich-text preset `plainLink`): links resolve like any
 * rich text (internal pages in the visitor's language, safe external URLs).
 */
export default function FooterRichText({
  value,
  className,
}: {
  value: Sanity.BlockContent;
  className?: string;
}) {
  return <SharedPortableText value={value} components={footerComponents} className={className} />;
}
