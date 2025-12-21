'use client';

import Link from 'next/link';
import { stegaClean } from 'next-sanity';
import type { ComponentProps } from 'react';
import { Button } from '@/components/ui/button';
import resolveUrl from '@/lib/resolveUrl';
import { validateExternalUrl } from '@/lib/validateExternalUrl';

// Define the allowed button variants matching the Button component
type ButtonVariant = 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive';

// Convert Link to CTA props
function _linkToCta(link: Sanity.MenuItem | null | undefined): Sanity.CTA {
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
  // Destructure Sanity-specific props to remove them from 'rest'
  internalLink,
  externalLink,
  linkType,
  text,
  ...rest
}: Sanity.CTA &
  ComponentProps<typeof Button> & {
    // Add optional types for the props we want to exclude/use as fallback
    internalLink?: Sanity.MenuItem['internal'];
    externalLink?: string;
    linkType?: 'internal' | 'external';
    text?: string;
  }) {
  // Construct a fallback link object if the main link prop is missing
  // This handles the flat structure used in some modules (like Hero)
  const effectiveLink =
    link ||
    (text && (linkType === 'internal' || linkType === 'external')
      ? {
          label: text,
          type: linkType,
          internal: internalLink,
          external: externalLink,
          params: undefined,
          newTab: undefined,
        }
      : null);

  if (!effectiveLink) return null;

  const { label, type, internal, external, params, newTab } = effectiveLink;
  const cleanStyle = stegaClean(style);
  // Map 'primary' to 'default' for shadcn Button
  const variant = (cleanStyle === 'primary' ? 'default' : cleanStyle) as ButtonVariant;
  const buttonContent = children || label || 'Button';

  // For internal links
  if (type === 'internal' && internal) {
    const href = resolveUrl(internal, {
      base: false,
      params: params,
    });

    return (
      <Button
        variant={variant}
        className={className}
        nativeButton={false}
        render={
          <Link
            href={href}
            target={newTab ? '_blank' : undefined}
            rel={newTab ? 'noopener noreferrer' : undefined}
            onClick={(e) => {
              if (href.includes('#')) {
                const [path, hash] = href.split('#');
                const currentPath = window.location.pathname;

                // If target is on the same page
                if (
                  (!path || path === currentPath || (path === '/' && currentPath === '/')) &&
                  hash
                ) {
                  e.preventDefault();
                  const element = document.getElementById(hash);
                  if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                  }
                }
              }
            }}
          >
            {buttonContent}
          </Link>
        }
        {...rest}
      />
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
      <Button
        variant={variant}
        className={className}
        nativeButton={false}
        render={
          <Link
            href={validatedUrl}
            target={newTab !== false ? '_blank' : undefined}
            rel={newTab !== false ? 'noopener noreferrer' : undefined}
          >
            {buttonContent}
          </Link>
        }
        {...rest}
      />
    );
  }

  return null;
}
