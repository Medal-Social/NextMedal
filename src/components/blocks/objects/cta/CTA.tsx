'use client';

import Link from 'next/link';
import { stegaClean } from 'next-sanity';
import { Button, buttonVariants } from '@/components/ui/button';
import { resolveUrlSync } from '@/lib/sanity/resolve-url';
import { cn } from '@/lib/utils/index';
import { validateExternalUrl } from '@/lib/validateExternalUrl';

// Define the allowed button variants matching the Button component
type ButtonVariant = 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive';
type ButtonSize = 'default' | 'xs' | 'sm' | 'lg' | 'icon' | 'icon-xs' | 'icon-sm' | 'icon-lg';

type CTAProps = Sanity.CTA & {
  internalLink?: Sanity.MenuItem['internal'];
  externalLink?: string;
  linkType?: 'internal' | 'external';
  text?: string;
  size?: ButtonSize;
  className?: string;
  children?: React.ReactNode;
};

// Build effective link from props (handles flat structure from some modules)
function buildEffectiveLink(props: CTAProps): Sanity.MenuItem | null {
  if (props.link) return props.link;

  const { text, linkType, internalLink, externalLink } = props;

  if (text && (linkType === 'internal' || linkType === 'external')) {
    return {
      _type: 'menuItem',
      label: text,
      type: linkType,
      internal: internalLink,
      external: externalLink,
      params: undefined,
      newTab: undefined,
    };
  }

  return null;
}

// Generate descriptive aria-label for generic link text
function getAriaLabel(
  linkText: string,
  internal?: Sanity.MenuItem['internal']
): string | undefined {
  const cleanText = stegaClean(linkText).trim().toLowerCase();

  // List of generic/non-descriptive link texts that need enhancement
  const genericTexts = ['read more', 'click here', 'learn more', 'more', 'continue', 'next'];

  if (!genericTexts.includes(cleanText)) {
    return undefined; // Text is already descriptive
  }

  // Try to generate a better description from the linked page
  if (internal?.metadata?.title) {
    const pageTitle = stegaClean(internal.metadata.title);
    return `${linkText}: ${pageTitle}`;
  }

  // Fallback to link type if we can't determine the page title
  if (internal?._type) {
    const typeLabel = internal._type
      .replace('collection.', '')
      .replace(/([A-Z])/g, ' $1')
      .trim();
    return `${linkText} about ${typeLabel}`;
  }

  return undefined;
}

// Get button variant from style
function getVariant(style?: string): ButtonVariant {
  const cleanStyle = stegaClean(style);
  return (cleanStyle === 'primary' ? 'default' : cleanStyle) as ButtonVariant;
}

// Handle smooth scroll for hash links on same page
function handleHashLinkClick(href: string, e: React.MouseEvent<HTMLAnchorElement>) {
  if (!href.includes('#')) return;

  const [path, hash] = href.split('#');
  const currentPath = window.location.pathname;
  const isCurrentPage = !path || path === currentPath || (path === '/' && currentPath === '/');

  if (isCurrentPage && hash) {
    e.preventDefault();
    document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth' });
  }
}

// Internal link button
function InternalLinkButton({
  internal,
  params,
  newTab,
  variant,
  size,
  className,
  buttonContent,
}: {
  internal: Sanity.MenuItem['internal'];
  params?: string;
  newTab?: boolean;
  variant: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  buttonContent: React.ReactNode;
}) {
  const href = resolveUrlSync(internal, { base: false, params });
  const ariaLabel =
    typeof buttonContent === 'string' ? getAriaLabel(buttonContent, internal) : undefined;

  return (
    <Link
      href={href}
      target={newTab ? '_blank' : undefined}
      rel={newTab ? 'noopener noreferrer' : undefined}
      onClick={(e) => handleHashLinkClick(href, e)}
      className={cn(buttonVariants({ variant, size }), className)}
      aria-label={ariaLabel}
    >
      {buttonContent}
    </Link>
  );
}

// External link button
function ExternalLinkButton({
  external,
  newTab,
  variant,
  size,
  className,
  buttonContent,
}: {
  external: string;
  newTab?: boolean;
  variant: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  buttonContent: React.ReactNode;
}) {
  const cleanUrl = stegaClean(external);
  const validatedUrl = validateExternalUrl(cleanUrl);

  if (!validatedUrl) {
    return (
      <Button variant={variant} size={size} className={className} disabled>
        {buttonContent}
      </Button>
    );
  }

  const shouldOpenNewTab = newTab !== false;

  // For external links, add basic aria-label for generic text
  const ariaLabel =
    typeof buttonContent === 'string' ? getAriaLabel(buttonContent, undefined) : undefined;

  return (
    <Link
      href={validatedUrl}
      target={shouldOpenNewTab ? '_blank' : undefined}
      rel={shouldOpenNewTab ? 'noopener noreferrer' : undefined}
      className={cn(buttonVariants({ variant, size }), className)}
      aria-label={
        ariaLabel ||
        (typeof buttonContent === 'string' && buttonContent.toLowerCase().includes('read more')
          ? `${buttonContent} (external link)`
          : undefined)
      }
    >
      {buttonContent}
    </Link>
  );
}

export default function CTA({
  link,
  style = 'primary',
  size,
  className,
  children,
  internalLink,
  externalLink,
  linkType,
  text,
}: CTAProps) {
  const effectiveLink = buildEffectiveLink({
    link,
    style,
    size,
    className,
    children,
    internalLink,
    externalLink,
    linkType,
    text,
  });

  if (!effectiveLink) return null;

  const { label, type, internal, external, params, newTab } = effectiveLink;
  const variant = getVariant(style);
  const buttonContent = children || label || 'Button';

  if (type === 'internal' && internal) {
    return (
      <InternalLinkButton
        internal={internal}
        params={params}
        newTab={newTab}
        variant={variant}
        size={size ?? undefined}
        className={className}
        buttonContent={buttonContent}
      />
    );
  }

  if (type === 'external' && external) {
    return (
      <ExternalLinkButton
        external={external}
        newTab={newTab}
        variant={variant}
        size={size ?? undefined}
        className={className}
        buttonContent={buttonContent}
      />
    );
  }

  return null;
}
