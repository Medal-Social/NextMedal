import { Section } from '@/components/ui/section';
import moduleProps from '@/lib/moduleProps';
import Content from './Content';

export default function RichtextModule({
  content,
  ...props
}: Partial<{
  content: any;
}> &
  Sanity.Module) {
  return (
    <Section className="grid gap-8" width="narrow" {...moduleProps(props)}>
      <Content value={content} />
    </Section>
  );
}
