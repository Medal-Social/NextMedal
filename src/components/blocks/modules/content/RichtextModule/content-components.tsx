import type { ComponentType, ReactNode } from 'react';
import Callout from '@/components/blocks/modules/marketing/Callout';
import LeadMagnet from '@/components/blocks/modules/marketing/LeadMagnet';
import { Video } from '@/components/blocks/objects/core';
import Code from './Code';
import Image from './Image';

type SocialEmbedRenderer = ComponentType<{
  platform: Sanity.SocialEmbed['platform'];
  url: string;
}>;

/**
 * Shared Portable Text type map for article/module richtext.
 * `SocialEmbed` is injected so the server Content can use the async oEmbed
 * card while the client-safe Content (gallery) uses the link-out fallback —
 * without pulling `server-only` into client bundles.
 */
export function createContentComponents(SocialEmbedRenderer: SocialEmbedRenderer) {
  return {
    types: {
      image: Image,
      video: ({ value }: { value: Sanity.Video }) => <Video data={value} />,
      socialEmbed: ({ value }: { value: Sanity.SocialEmbed }) => (
        <SocialEmbedRenderer platform={value.platform} url={value.url} />
      ),
      code: Code,
      'lead-magnet': ({ value }: { value: Sanity.LeadMagnet }) => <LeadMagnet {...value} />,
      callout: ({ value }: { value: Sanity.Callout }) => <Callout {...value} />,
    },
  };
}

export type ContentChildren = ReactNode;
