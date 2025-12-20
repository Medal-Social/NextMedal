'use client';
import { X } from 'lucide-react';
import Link from 'next/link';
import { PortableText } from 'next-sanity';
import { useState } from 'react';
import resolveUrl from '@/lib/resolveUrl';
import Scheduler from './Scheduler';
export default function BannerClient({
  banner,
}: {
  banner: Sanity.Banner & Sanity.Module;
}) {
  const { start, end, content, cta } = banner;
  const [isClosed, setIsClosed] = useState(false);
  return (
    !isClosed && (
      <Scheduler start={start} end={end}>
        <div className="relative isolate flex items-center gap-x-6 overflow-hidden bg-muted px-6 py-2.5 sm:px-3.5 sm:before:flex-1">
          <div
            aria-hidden="true"
            className="absolute top-1/2 left-[max(-7rem,calc(50%-52rem))] -z-10 -translate-y-1/2 transform-gpu blur-2xl"
          >
            <div
              style={{
                clipPath:
                  'polygon(74.8% 41.9%, 97.2% 73.2%, 100% 34.9%, 92.5% 0.4%, 87.5% 0%, 75% 28.6%, 58.5% 54.6%, 50.1% 56.8%, 46.9% 44%, 48.3% 17.4%, 24.7% 53.9%, 0% 27.9%, 11.9% 74.2%, 24.9% 54.1%, 68.6% 100%, 74.8% 41.9%)',
              }}
              className="aspect-577/310 w-[36.0625rem] bg-linear-to-r from-[#ff80b5] to-[#9089fc] opacity-30"
            />
          </div>
          <div
            aria-hidden="true"
            className="absolute top-1/2 left-[max(45rem,calc(50%+8rem))] -z-10 -translate-y-1/2 transform-gpu blur-2xl"
          >
            <div
              style={{
                clipPath:
                  'polygon(74.8% 41.9%, 97.2% 73.2%, 100% 34.9%, 92.5% 0.4%, 87.5% 0%, 75% 28.6%, 58.5% 54.6%, 50.1% 56.8%, 46.9% 44%, 48.3% 17.4%, 24.7% 53.9%, 0% 27.9%, 11.9% 74.2%, 24.9% 54.1%, 68.6% 100%, 74.8% 41.9%)',
              }}
              className="aspect-577/310 w-[36.0625rem] bg-linear-to-r from-[#ff80b5] to-[#9089fc] opacity-30"
            />
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <div className="text-sm/6 text-foreground">
              <div className="">
                <PortableText value={content} />
              </div>
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
              className="flex-none rounded-full bg-foreground px-3.5 py-1 text-sm font-semibold text-background shadow-xs hover:bg-foreground/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
            >
              {cta?.label}
            </Link>
          </div>
          <div className="flex flex-1 justify-end">
            <button
              type="button"
              className="-m-3 p-1 focus-visible:outline-offset-[-4px] hover:bg-foreground/10 rounded-full"
              onClick={() => setIsClosed(true)}
            >
              <span className="sr-only">Dismiss</span>
              <X aria-hidden="true" className="size-5 text-foreground" />
            </button>
          </div>
        </div>
      </Scheduler>
    )
  );
}
