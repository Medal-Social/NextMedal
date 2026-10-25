import type { PreviewValue } from 'sanity';
import { getBlockText } from '@/sanity/lib/utils';

/** Text for a Studio list preview. Line breaks become spaces (spec §1 rule 4). */
export function previewText(value: unknown): string {
  if (typeof value === 'string') return value.replace(/\s*\n\s*/g, ' ').trim();
  if (Array.isArray(value)) {
    if (value.every((item) => typeof item === 'string')) return previewText(value.join(' · '));
    return previewText(getBlockText(value, ' '));
  }
  return '';
}

/**
 * "Block name + its title text" list preview for a page block. `fallback` is a
 * second source (e.g. a referenced document title) used when the title is empty.
 */
export function blockPreview(
  blockTitle: string,
  select: { title?: string; italic?: string; media?: string; fallback?: string } = {}
) {
  return {
    select,
    prepare: ({
      title,
      italic,
      media,
      fallback,
    }: {
      title?: unknown;
      italic?: unknown;
      media?: PreviewValue['media'];
      fallback?: unknown;
    }) => ({
      title:
        [previewText(title), previewText(italic)].filter(Boolean).join(' ') ||
        previewText(fallback) ||
        blockTitle,
      subtitle: blockTitle,
      media,
    }),
  };
}
