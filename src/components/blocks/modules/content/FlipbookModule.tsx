import { stegaClean } from 'next-sanity';
import { Flipbook } from '@/components/blocks/objects/flipbook';
import { Section } from '@/components/ui/section';
import moduleProps from '@/lib/sanity/module-props';

export default function FlipbookModule({ title, src, filename, size, ...props }: Sanity.Flipbook) {
  if (!src) return null;
  return (
    <Section {...moduleProps(props)}>
      <Flipbook src={src} title={stegaClean(title) || undefined} filename={filename} size={size} />
    </Section>
  );
}
