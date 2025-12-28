'use client';

import Link from 'next/link';
import { stegaClean } from 'next-sanity';
import type { ComponentProps } from 'react';
import { Button } from '@/components/ui/button';
import resolveUrl from '@/lib/resolveUrl';
import { validateExternalUrl } from '@/lib/validateExternalUrl';

// Define the allowed button variants matching the Button component
type ButtonVariant = 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive';

type CTAProps = Sanity.CTA &
  ComponentProps<typeof Button> & {
    internalLink?: Sanity.MenuItem['internal'];
    externalLink?: string;
    linkType?: 'internal' | 'external';
    text?: string;
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
  className,
  buttonContent,
  rest,
}: {
  internal: Sanity.MenuItem['internal'];
  params?: string;
  newTab?: boolean;
  variant: ButtonVariant;
  className?: ComponentProps<typeof Button>['className'];
  buttonContent: React.ReactNode;
  rest: Omit<ComponentProps<typeof Button>, 'variant' | 'className'>;
}) {
  const href = resolveUrl(internal, { base: false, params });

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
          onClick={(e) => handleHashLinkClick(href, e)}
        >
          {buttonContent}
        </Link>
      }
      {...rest}
    />
  );
}

// External link button
function ExternalLinkButton({
  external,
  newTab,
  variant,
  className,
  buttonContent,
  rest,
}: {
  external: string;
  newTab?: boolean;
  variant: ButtonVariant;
  className?: ComponentProps<typeof Button>['className'];
  buttonContent: React.ReactNode;
  rest: Omit<ComponentProps<typeof Button>, 'variant' | 'className'>;
}) {
  const cleanUrl = stegaClean(external);
  const validatedUrl = validateExternalUrl(cleanUrl);

  if (!validatedUrl) {
    return (
      <Button variant={variant} className={className} disabled {...rest}>
        {buttonContent}
      </Button>
    );
  }

  const shouldOpenNewTab = newTab !== false;

  return (
    <Button
      variant={variant}
      className={className}
      nativeButton={false}
      render={
        <Link
          href={validatedUrl}
          target={shouldOpenNewTab ? '_blank' : undefined}
          rel={shouldOpenNewTab ? 'noopener noreferrer' : undefined}
        >
          {buttonContent}
        </Link>
      }
      {...rest}
    />
  );
}

export default function CTA({
  link,
  style = 'primary',
  className,
  children,
  internalLink,
  externalLink,
  linkType,
  text,
  ...rest
}: CTAProps) {
  const effectiveLink = buildEffectiveLink({
    link,
    style,
    className,
    children,
    internalLink,
    externalLink,
    linkType,
    text,
    ...rest,
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
        className={className}
        buttonContent={buttonContent}
        rest={rest}
      />
    );
  }

  if (type === 'external' && external) {
    return (
      <ExternalLinkButton
        external={external}
        newTab={newTab}
        variant={variant}
        className={className}
        buttonContent={buttonContent}
        rest={rest}
      />
    );
  }

  return null;
}
