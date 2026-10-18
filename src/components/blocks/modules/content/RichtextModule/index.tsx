import { Section } from '@/components/ui/section';
import moduleProps from '@/lib/sanity/module-props';
// Server ModuleRenderer path — full oEmbed social cards.
import Content from './Content.server';

export default function RichtextModule({ content, ...props }: Sanity.Richtext) {
  if (!content) return null;

  return (
    <Section className="grid gap-8" width="narrow" {...moduleProps(props)}>
      <Content value={content} />
    </Section>
  );
}
