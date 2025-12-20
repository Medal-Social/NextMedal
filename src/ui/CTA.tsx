import Link from 'next/link';
import { stegaClean } from 'next-sanity';
import type { ComponentProps } from 'react';
import { Button } from '@/components/ui/button';
import resolveUrl from '@/lib/resolveUrl';
import { validateExternalUrl } from '@/lib/validateExternalUrl';

// Define the allowed button variants
type ButtonVariant = 'default' | 'ghost' | 'link';

// Convert Link to CTA props
function linkToCta(link: Sanity.MenuItem | null | undefined): Sanity.CTA {
  if (!link) {
    return {
      _type: 'cta',
      link: {
        _type: 'menuItem',
        label: 'Button',
        type: 'internal',
      },
      style: 'primary',
    };
  }

  return {
    _type: 'cta',
    link: link,
    style: 'primary',
  };
}

export default function CTA({
  link,
  style = 'primary',
  className,
  children,
  ...rest
}: Sanity.CTA & ComponentProps<typeof Button>) {
  if (!link) return null;

  const { label, type, internal, external, params, newTab } = link;
  const cleanStyle = stegaClean(style);
  // Map 'primary' to 'default' for shadcn Button
  const variant = (cleanStyle === 'primary' ? 'default' : cleanStyle) as ButtonVariant;
  const buttonContent = children || label || 'Button';

  // For internal links
  if (type === 'internal' && internal) {
    return (
      <Button variant={variant} className={className} asChild {...rest}>
        <Link
          href={resolveUrl(internal, {
            base: false,
            params: params,
          })}
          target={newTab ? '_blank' : undefined}
          rel={newTab ? 'noopener noreferrer' : undefined}
        >
          {buttonContent}
        </Link>
      </Button>
    );
  }

  // For external links
  if (type === 'external' && external) {
    const cleanUrl = stegaClean(external);
    const validatedUrl = validateExternalUrl(cleanUrl);

    if (!validatedUrl) {
      return (
        <Button variant={variant} className={className} disabled {...rest}>
          {buttonContent}
        </Button>
      );
    }

    return (
      <Button variant={variant} className={className} asChild {...rest}>
        <Link 
          href={validatedUrl}
          target={newTab !== false ? '_blank' : undefined}
          rel={newTab !== false ? 'noopener noreferrer' : undefined}
        >
          {buttonContent}
        </Link>
      </Button>
    );
  }

  return null;
}
