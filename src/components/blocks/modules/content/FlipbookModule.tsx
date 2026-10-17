import { stegaClean } from 'next-sanity';
import { Flipbook } from '@/components/blocks/objects/flipbook';
import { Section } from '@/components/ui/section';
import moduleProps from '@/lib/sanity/module-props';

export default function FlipbookModule({ title, src, filename, size, ...props }: Sanity.Flipbook) {
  if (!src) return null;
  return (
    // Phones: the book runs edge to edge (no page padding) so it reads like a book app.
    <Section {...moduleProps(props)} className="max-sm:px-0">
      <Flipbook
        // Visual editing may stega-encode strings; pdf.js and the download link need plain values.
        src={stegaClean(src)}
        title={stegaClean(title) || undefined}
        filename={filename ? stegaClean(filename) : undefined}
        size={size}
      />
    </Section>
  );
}
