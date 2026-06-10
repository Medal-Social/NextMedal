import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

export const maxDuration = 60; // sec

// Inlined studio viewport (mirrors `next-sanity/studio`'s `viewport`) so this
// server route doesn't import `next-sanity/studio` — that keeps the heavy Studio
// module out of the route's server bundle.
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  interactiveWidget: 'resizes-content' as const,
};

export const metadata: Metadata = {
  title: 'Studio',
  icons: {
    icon: '/studio-icon.svg',
    apple: '/apple-icon.png',
  },
};

// Hosted Studio used by the Cloudflare deployment (see below).
const HOSTED_STUDIO_URL = 'https://nextmedal.sanity.studio';

export default async function StudioPage() {
  // The Cloudflare build can't embed the Studio: `sanity.config` pulls every
  // schema + Studio plugin into the route's server bundle, which blows past the
  // Worker size limit. CLOUDFLARE_BUILD is inlined via next.config `env`, so on
  // that build this condition is statically `true` and the `else` branch (with
  // the heavy dynamic import) is dead-code-eliminated from the Worker; editors
  // are sent to the hosted Studio instead. On every other target the import runs
  // and the Studio is embedded as before.
  if (process.env.CLOUDFLARE_BUILD === 'true') {
    redirect(HOSTED_STUDIO_URL);
  } else {
    const { default: EmbeddedStudio } = await import('./EmbeddedStudio');
    return <EmbeddedStudio />;
  }
}
