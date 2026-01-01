import Callout from '@/components/blocks/modules/marketing/Callout';
import LeadMagnet from '@/components/blocks/modules/marketing/LeadMagnet';
import SharedPortableText from '@/components/blocks/modules/SharedPortableText';
import { SocialEmbed, Video } from '@/components/blocks/objects/core';
import { cn } from '@/lib/utils/index';
import Code from './Code';
import Image from './Image';

const components = {
  types: {
    image: Image,
    video: ({ value }: { value: Sanity.Video }) => <Video data={value} />,
    socialEmbed: ({ value }: { value: Sanity.SocialEmbed }) => (
      <SocialEmbed platform={value.platform} url={value.url} />
    ),
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
