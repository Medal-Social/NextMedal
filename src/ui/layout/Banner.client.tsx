'use client';
import { X } from 'lucide-react';
import Link from 'next/link';
import { PortableText } from 'next-sanity';
import { useState } from 'react';
import resolveUrl from '@/lib/resolveUrl';
import { Scheduler } from '@/ui/utility';
export default function BannerClient({ banner }: { banner: Sanity.Banner & Sanity.Module }) {
  const { start, end, content, cta } = banner;
  const [isClosed, setIsClosed] = useState(false);
  return (
    !isClosed && (
      <Scheduler start={start} end={end}>
        <div className="relative isolate flex items-center justify-center gap-x-6 overflow-hidden bg-gradient-brand text-white px-6 py-2.5 sm:px-3.5">
          <div className="relative flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
            <div className="text-sm font-medium text-white/90 [&_p]:m-0 [&_p]:leading-normal">
              <PortableText
                value={content}
                components={{
                  block: {
                    normal: ({ children }) => <p className="inline">{children}</p>,
                  },
                }}
              />
            </div>

            <Link
              href={
                cta?.type === 'internal'
                  ? resolveUrl(cta.internal, { base: false })
                  : cta?.external
                    ? cta.external
                    : '#'
              }
              target={cta?.external && '_blank'}
              className="flex-none inline-flex items-center justify-center rounded-full bg-white px-4 py-1 text-sm font-bold text-brand-navy shadow-sm hover:bg-white/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white transition-colors leading-none h-7"
            >
              {cta?.label}
            </Link>
          </div>
          <div className="absolute right-0 top-0 bottom-0 flex items-center pr-4">
            <button
              type="button"
              className="-m-3 p-1 focus-visible:outline-offset-[-4px] hover:bg-white/10 rounded-full transition-colors"
              onClick={() => setIsClosed(true)}
            >
              <span className="sr-only">Dismiss</span>
              <X aria-hidden="true" className="size-4 text-white/80 hover:text-white" />
            </button>
          </div>
        </div>
      </Scheduler>
    )
  );
}
