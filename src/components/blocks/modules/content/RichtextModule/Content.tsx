import { Suspense } from 'react';
import Callout from '@/components/blocks/modules/marketing/Callout';
import LeadMagnet from '@/components/blocks/modules/marketing/LeadMagnet';
import SharedPortableText from '@/components/blocks/modules/SharedPortableText';
import { Video } from '@/components/blocks/objects/core';
import SocialEmbed from '@/components/blocks/objects/core/SocialEmbed';
import { cn } from '@/lib/utils/index';
import Code from './Code';
import Image from './Image';

function SocialEmbedSkeleton() {
  return (
    <div
      className="my-6 w-full max-w-xl animate-pulse overflow-hidden rounded-xl bg-card p-4 shadow-[var(--card-shadow,0_1px_3px_rgb(0_0_0/0.08))]"
      aria-hidden
    >
      <div className="flex items-center gap-3">
        <div className="size-10 rounded-full bg-muted" />
        <div className="flex-1 space-y-2">
          <div className="h-3 w-1/3 rounded bg-muted" />
          <div className="h-2 w-1/4 rounded bg-muted" />
        </div>
      </div>
      <div className="mt-4 space-y-2">
        <div className="h-2 w-full rounded bg-muted" />
        <div className="h-2 w-5/6 rounded bg-muted" />
      </div>
    </div>
  );
}

const components = {
  types: {
    image: Image,
    video: ({ value }: { value: Sanity.Video }) => <Video data={value} />,
    socialEmbed: ({ value }: { value: Sanity.SocialEmbed }) => (
      <Suspense fallback={<SocialEmbedSkeleton />}>
        <SocialEmbed platform={value.platform} url={value.url} />
      </Suspense>
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
