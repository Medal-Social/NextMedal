import { NextStudio } from 'next-sanity/studio';
import config from '$/sanity.config';

// Embedded Sanity Studio. Split into its own module (imported dynamically from
// page.tsx) so the heavy `sanity.config` + Studio plugin graph can be excluded
// from the Cloudflare Worker bundle — see the CLOUDFLARE_BUILD branch in page.tsx.
export default function EmbeddedStudio() {
  return <NextStudio config={config} />;
}
