/**
 * Gallery richtext must stay client-safe: paragraphs/images/callouts render;
 * only socialEmbed blocks degrade to the link-out fallback card.
 */

import { render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { describe, expect, it, vi } from 'vitest';
import { GalleryModuleRenderer } from '@/components/blocks/modules/GalleryModuleRenderer';
import messages from '@/messages/en.json';

vi.mock('next/image', () => ({
  default: (props: { src: string; alt: string }) => (
    // biome-ignore lint/performance/noImgElement: test stub for next/image
    <img src={props.src} alt={props.alt} />
  ),
}));

vi.mock('@/lib/sanity/module-props', () => ({
  default: () => ({}),
}));

function wrap(ui: React.ReactNode) {
  return (
    <NextIntlClientProvider locale="en" messages={messages}>
      {ui}
    </NextIntlClientProvider>
  );
}

const richtextModule = {
  _type: 'richtext',
  _key: 'rt1',
  content: [
    {
      _type: 'block',
      _key: 'b1',
      style: 'normal',
      markDefs: [],
      children: [{ _type: 'span', _key: 's1', text: 'Gallery caption still renders.', marks: [] }],
    },
    {
      _type: 'socialEmbed',
      _key: 'se1',
      platform: 'twitter',
      url: 'https://x.com/AnthropicAI/status/2110047081414987957',
    },
  ],
} as unknown as Sanity.Module;

describe('GalleryModuleRenderer richtext', () => {
  it('renders portable text and degrades only social embeds to a link-out card', () => {
    render(wrap(<GalleryModuleRenderer module={richtextModule} />));

    // Before the ServerOnlyPlaceholder regression, captions rendered; they must still.
    expect(screen.getByText('Gallery caption still renders.')).toBeInTheDocument();

    // Must NOT show the full-module server-only placeholder.
    expect(screen.queryByText(/requires server-side rendering/i)).not.toBeInTheDocument();

    // Social embed is the link-out fallback card (client-safe), not a blank hole.
    const article = screen.getByRole('article');
    expect(article).toHaveAttribute('data-platform', 'x');
    expect(article).toHaveAttribute('data-fallback', 'true');
    expect(screen.getByRole('link', { name: /View on X/i })).toHaveAttribute(
      'href',
      'https://x.com/AnthropicAI/status/2110047081414987957'
    );
  });

  it('does not import server-only SocialEmbed into the gallery client module graph', async () => {
    // Guard: the client RichtextModule entry must resolve Content (fallback),
    // not Content.server (oEmbed / server-only).
    const fs = await import('node:fs/promises');
    const path = await import('node:path');
    const file = await fs.readFile(
      path.resolve('src/components/blocks/modules/content/RichtextModule/client.tsx'),
      'utf8'
    );
    const importLines = file
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.startsWith('import '));

    expect(importLines.some((line) => line.includes("from './Content'"))).toBe(true);
    expect(importLines.some((line) => line.includes('Content.server'))).toBe(false);
    expect(importLines.some((line) => line.includes('objects/core/SocialEmbed'))).toBe(false);
  });
});
