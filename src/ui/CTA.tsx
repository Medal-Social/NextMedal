import { Button } from '@/components/ui/button';
import resolveUrl from '@/lib/resolveUrl';
import { validateExternalUrl } from '@/lib/validateExternalUrl';
import { stegaClean } from 'next-sanity';
import Link from 'next/link';
import type { ComponentProps } from 'react';

// Define the allowed button variants and sizes from shadcn
type ButtonVariant = 'default' | 'secondary' | 'outline' | 'ghost' | 'link' | 'destructive';

type ButtonSize = 'default' | 'sm' | 'lg';

// Convert Link to CTA props
function linkToCta(link: Sanity.Link | null | undefined): Sanity.CTA {
  if (!link) {
    // Return default/fallback CTA properties if link is null or undefined
    return {
      _type: 'cta',
      text: 'Button',
      linkType: 'internal',
      style: 'default',
    };
  }

  // In a Link object, "type" contains "internal" or "external"
  // In a CTA object, this is called "linkType"
  return {
    _type: 'cta',
    text: link.label || link.internal?.title || 'Button',
    linkType: link.type,
    internalLink: link.type === 'internal' ? link.internal : undefined,
    externalLink: link.type === 'external' ? link.external : undefined,
    params: typeof link.params === 'string' ? link.params : undefined,
    style: 'link', // Default style for converted links
  };
}

type CTADirectProps = Sanity.CTA &
  Omit<ComponentProps<'a'>, 'ref'> & {
    size?: ButtonSize;
  };
type CTALinkProps = Omit<ComponentProps<'a'>, 'ref'> & {
  link?: Sanity.Link | null;
  style?: string;
  size?: ButtonSize;
};

type CTAProps = CTADirectProps | CTALinkProps;

export default function CTA(props: CTAProps) {
  // Determine if this is a link-based CTA or a direct CTA
  const hasLink = 'link' in props && props.link;

  // If it's a link-based CTA, extract the label and children
  const linkLabel = hasLink ? props.link?.label : undefined;
  const extractedChildren = hasLink && !props.children ? linkLabel : props.children;

  // Create converted props with the right structure
  const convertedProps: CTADirectProps = hasLink
    ? {
        ...props,
        ...linkToCta(props.link),
        // Preserve children if they exist, otherwise use link label
        children: extractedChildren,
      }
    : (props as CTADirectProps);

  // Now we can safely destructure
  const {
    _type,
    _key,
    text,
    linkType,
    internalLink,
    externalLink,
    style,
    icon,
    newTab,
    params,
    className,
    children,
    size,
    ...rest
  } = convertedProps;

  // Cast the style to ButtonVariant with fallback
  const cleanStyle = stegaClean(style);
  const variant = (cleanStyle as ButtonVariant) || 'default';

  // Add fullWidth to className if it's true
  const buttonClassName = `${className || ''}`.trim();

  // Prioritize explicit children, then text from props, then title from internalLink
  const buttonContent = children || text || internalLink?.title || 'Button';
  const shouldOpenNewTab = newTab === true;
  const linkProps = shouldOpenNewTab ? { target: '_blank', rel: 'noopener noreferrer' } : {};

  // For internal links
  if (linkType === 'internal' && internalLink) {
    return (
      <Button variant={variant} className={buttonClassName} size={size || 'default'} asChild>
        <Link
          href={resolveUrl(internalLink as any, {
            base: false,
            params: params,
          })}
          {...linkProps}
          {...rest}
        >
          {buttonContent}
        </Link>
      </Button>
    );
  }

  // For external links
  if (linkType === 'external' && externalLink) {
    const cleanUrl = stegaClean(externalLink);
    const validatedUrl = validateExternalUrl(cleanUrl);

    if (!validatedUrl) {
      console.warn(`Invalid external URL detected and blocked: ${cleanUrl}`);
      return (
        <Button variant={variant} className={buttonClassName} size={size || 'default'} disabled>
          {buttonContent}
        </Button>
      );
    }

    return (
      <Button variant={variant} className={buttonClassName} size={size || 'default'} asChild>
        <Link href={validatedUrl} {...linkProps} {...rest}>
          {buttonContent}
        </Link>
      </Button>
    );
  }

  // Omit anchor-specific props when rendering as Button
  const { href, target, rel, ...buttonProps } = rest as any;

  return (
    <Button variant={variant} className={buttonClassName} size={size || 'default'} {...buttonProps}>
      {buttonContent}
    </Button>
  );
}
