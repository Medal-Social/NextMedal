import { cn } from '@/lib/utils';
import Callout from '@/ui/modules/Callout';
import LeadMagnet from '@/ui/modules/LeadMagnet';
import SharedPortableText from '@/ui/modules/SharedPortableText';
import Video from '@/ui/Video';
import Code from './Code';
import Image from './Image';

const components = {
  types: {
    image: Image,
    video: ({ value }: { value: Sanity.Video }) => <Video data={value} />,
    code: Code,
    'lead-magnet': ({ value }: { value: Sanity.LeadMagnet }) => <LeadMagnet {...value} />,
    callout: ({ value }: { value: Sanity.Callout }) => <Callout {...value} />,
  },
};

export default function Content({
  value,
  className,
  children,
}: { value: Sanity.BlockContent } & React.ComponentProps<'div'>) {
  return (
    <div className={cn('relative', className)}>
      <SharedPortableText value={value} variant="prose" components={components} />

      {children}
    </div>
  );
}
