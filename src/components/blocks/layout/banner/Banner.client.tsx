'use client';
import { X } from 'lucide-react';
import Link from 'next/link';
import { PortableText } from 'next-sanity';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import resolveUrl from '@/lib/sanity/resolve-url';

const BANNER_HEIGHT_VALUE = 40; // pixels

export default function BannerClient({ banner }: { banner: Sanity.Banner & Sanity.Module }) {
  const { content, cta } = banner;
  const [isClosed, setIsClosed] = useState(false);

  // Set banner height CSS variable on mount and clear on dismiss
  useEffect(() => {
    if (!isClosed) {
      document.documentElement.style.setProperty('--banner-height', `${BANNER_HEIGHT_VALUE}px`);
    } else {
      document.documentElement.style.setProperty('--banner-height', '0px');
    }

    return () => {
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
      className="relative flex items-center justify-center gap-x-6 bg-brand-700 text-white px-6 py-2 sm:px-3.5"
      style={{ height: `${BANNER_HEIGHT_VALUE}px` }}
    >
      <div className="relative flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
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
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-white px-2.5 h-8 text-sm font-medium text-brand-700 hover:bg-white/90 transition-all focus-visible:ring-[3px] focus-visible:ring-white/50 outline-none"
          >
            {cta.label}
          </Link>
        )}
      </div>
      <div className="absolute right-0 top-0 bottom-0 flex items-center pr-4">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={handleClose}
          className="text-white/80 hover:text-white hover:bg-white/10"
        >
          <span className="sr-only">Dismiss</span>
          <X aria-hidden="true" className="size-4" />
        </Button>
      </div>
    </div>
  );
}
