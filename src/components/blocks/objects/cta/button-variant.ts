import { stegaClean } from 'next-sanity';

export type ButtonVariant = 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive';

/**
 * Button look for a stored CTA style. A missing style (undefined, or `null`
 * because CTA_QUERY projects `style` and the lean-schema migration removes it)
 * is the solid primary button.
 */
export function buttonVariantFor(style?: string | null): ButtonVariant {
  const clean = stegaClean(style);
  if (!clean || clean === 'primary') return 'default';
  return clean as ButtonVariant;
}
