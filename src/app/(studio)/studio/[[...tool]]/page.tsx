import type { Metadata } from 'next';
import { NextStudio, viewport as studioViewport } from 'next-sanity/studio';
import config from '$/sanity.config';

export const maxDuration = 60; // sec

export const viewport = studioViewport;

export const metadata: Metadata = {
  title: 'Studio',
  icons: {
    icon: '/studio-icon.svg',
    apple: '/apple-icon.png',
  },
};

export default function StudioPage() {
  return <NextStudio config={config} />;
}
