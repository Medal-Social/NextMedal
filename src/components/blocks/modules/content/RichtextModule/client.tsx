'use client';

import { Section } from '@/components/ui/section';
import moduleProps from '@/lib/sanity/module-props';
// Client gallery path — paragraphs/images/callouts render; social embeds are
// link-out fallback cards only (no server-only oEmbed resolve).
import Content from './Content';

/**
 * Client-safe RichtextModule for ComponentGallery previews.
 * Must not import the server Content entry or SocialEmbed (server-only).
 */
export default function RichtextModuleClient({ content, ...props }: Sanity.Richtext) {
  if (!content) return null;

  return (
    <Section className="grid gap-8" width="narrow" {...moduleProps(props)}>
      <Content value={content} />
    </Section>
  );
}
