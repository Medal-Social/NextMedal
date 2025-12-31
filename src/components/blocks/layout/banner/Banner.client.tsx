'use client';
import { X } from 'lucide-react';
import Link from 'next/link';
import { PortableText } from 'next-sanity';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import resolveUrl from '@/lib/sanity/resolve-url';

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
    const resizeObserver = new ResizeObserver(updateHeight);
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
      className="relative flex items-center justify-center bg-brand-700 text-white min-h-10 px-10 py-2 sm:px-12"
    >
      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-center">
        <div className="text-sm font-medium [&_p]:m-0 [&_p]:leading-normal">
          <PortableText
            value={content}
            components={{
              block: {
                normal: ({ children }) => <p className="inline">{children}</p>,
              },
            }}
          />
        </div>

        {cta?.label && (
          <Link
            href={
              cta?.type === 'internal'
                ? resolveUrl(cta.internal, { base: false })
                : cta?.external
                  ? cta.external
                  : '#'
            }
            target={cta?.external ? '_blank' : undefined}
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-white px-2.5 h-7 text-xs font-semibold text-brand-700 hover:bg-white/90 transition-all focus-visible:ring-[3px] focus-visible:ring-white/50 outline-none shrink-0"
          >
            {cta.label}
          </Link>
        )}
      </div>
      <div className="absolute right-1 top-1/2 -translate-y-1/2 sm:right-2">
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={handleClose}
          className="text-white/80 hover:text-white hover:bg-white/10 rounded-full"
        >
          <span className="sr-only">Dismiss</span>
          <X aria-hidden="true" className="size-3.5" />
        </Button>
      </div>
    </div>
  );
}
