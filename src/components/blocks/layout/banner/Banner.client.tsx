'use client';
import { X } from 'lucide-react';
import { PortableText, stegaClean } from 'next-sanity';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/navigation';
import { resolveUrlSync } from '@/lib/sanity/resolve-url';

/**
 * Generate descriptive aria-label for generic link text to improve accessibility.
 * Returns undefined if the text is already descriptive.
 */
function getAriaLabel(
  linkText: string,
  internal?: Sanity.MenuItem['internal'],
  linkType?: 'internal' | 'external'
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

  // For external links, just add basic context
  if (linkType === 'external') {
    return `${linkText} (external link)`;
  }

  return undefined;
}

export default function BannerClient({ banner }: { banner: Sanity.Banner & Sanity.Module }) {
  const { content, cta } = banner;
  const [isClosed, setIsClosed] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Set banner height CSS variable dynamically based on actual content height
  useEffect(() => {
    if (isClosed) {
      document.documentElement.style.setProperty('--banner-height', '0px');
      return;
    }

    const updateHeight = () => {
      if (containerRef.current) {
        const height = containerRef.current.offsetHeight;
        document.documentElement.style.setProperty('--banner-height', `${height}px`);
      }
    };

    // Initial measurement
    updateHeight();

    // Re-measure on resize
    const resizeObserver = new ResizeObserver(() => {
      updateHeight();
    });
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
      document.documentElement.style.setProperty('--banner-height', '0px');
    };
  }, [isClosed]);

  // Handle dismiss
  const handleClose = () => {
    setIsClosed(true);
  };

  if (isClosed) return null;

  return (
    <div
      ref={containerRef}
      className="relative flex min-h-10 items-center justify-center bg-brand-700 px-10 py-2 text-white sm:px-12"
    >
      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-center">
        <div className="font-medium text-sm [&_p]:m-0 [&_p]:leading-normal">
          <PortableText
            value={content}
            components={{
              block: {
                normal: ({ children }) => <p className="inline">{children}</p>,
              },
            }}
          />
        </div>

        {cta?.label &&
          (() => {
            let href = '#';
            if (cta?.type === 'internal') {
              href = resolveUrlSync(cta.internal, { base: false });
            } else if (cta?.external) {
              href = cta.external;
            }
            return (
              <Link
                href={href}
                target={cta?.external ? '_blank' : undefined}
                className="inline-flex h-7 shrink-0 items-center justify-center rounded-md border border-transparent bg-white px-2.5 font-semibold text-brand-700 text-xs outline-none transition-all hover:bg-white/90 focus-visible:ring-[3px] focus-visible:ring-white/50"
                aria-label={getAriaLabel(cta.label, cta.internal, cta.type)}
              >
                {cta.label}
              </Link>
            );
          })()}
      </div>
      <div className="absolute top-1/2 right-1 -translate-y-1/2 sm:right-2">
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={handleClose}
          className="rounded-full text-white/80 hover:bg-white/10 hover:text-white"
        >
          <span className="sr-only">Dismiss</span>
          <X aria-hidden="true" className="size-3.5" />
        </Button>
      </div>
    </div>
  );
}
