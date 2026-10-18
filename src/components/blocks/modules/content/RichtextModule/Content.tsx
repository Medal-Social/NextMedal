/**
 * Client-safe richtext Content — social embeds render as link-out fallback cards
 * (no server-only oEmbed resolve). Used by the ComponentGallery preview path.
 *
 * Article / event / newsletter pages and server RichtextModule import
 * `Content.server` instead for the full Medal oEmbed cards.
 */

import SharedPortableText from '@/components/blocks/modules/SharedPortableText';
import { SocialEmbedFallback } from '@/components/blocks/objects/core/social-embed/social-embed-fallback';
import { cn } from '@/lib/utils/index';
import { createContentComponents } from './content-components';

const components = createContentComponents(SocialEmbedFallback);

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
