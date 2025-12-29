'use client';
import { X } from 'lucide-react';
import Link from 'next/link';
import { PortableText } from 'next-sanity';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import resolveUrl from '@/lib/resolveUrl';
import { Scheduler } from '@/ui/utility';

function BannerContent({
  content,
  cta,
  onClose,
}: {
  content: Sanity.Banner['content'];
  cta: Sanity.Banner['cta'];
  onClose: () => void;
}) {
  const bannerRef = useRef<HTMLDivElement>(null);

  // Update CSS variable for banner height
  useEffect(() => {
    const updateBannerHeight = () => {
      if (bannerRef.current) {
        document.documentElement.style.setProperty(
          '--banner-height',
          `${bannerRef.current.offsetHeight}px`
        );
      }
    };

    // Use RAF to ensure DOM is ready
    requestAnimationFrame(updateBannerHeight);
    window.addEventListener('resize', updateBannerHeight, { passive: true });

    return () => {
      window.removeEventListener('resize', updateBannerHeight);
      document.documentElement.style.setProperty('--banner-height', '0px');
    };
  }, []);

  return (
    <div
      ref={bannerRef}
      className="fixed top-0 left-0 right-0 z-[60] flex items-center justify-center gap-x-6 bg-brand-700 text-white px-6 py-2 sm:px-3.5"
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
          onClick={onClose}
          className="text-white/80 hover:text-white hover:bg-white/10"
        >
          <span className="sr-only">Dismiss</span>
          <X aria-hidden="true" className="size-4" />
        </Button>
      </div>
    </div>
  );
}

export default function BannerClient({ banner }: { banner: Sanity.Banner & Sanity.Module }) {
  const { start, end, content, cta } = banner;
  const [isClosed, setIsClosed] = useState(false);

  // Reset banner height when closed
  useEffect(() => {
    if (isClosed) {
      document.documentElement.style.setProperty('--banner-height', '0px');
    }
  }, [isClosed]);

  if (isClosed) return null;

  return (
    <Scheduler start={start} end={end}>
      <BannerContent content={content} cta={cta} onClose={() => setIsClosed(true)} />
    </Scheduler>
  );
}
