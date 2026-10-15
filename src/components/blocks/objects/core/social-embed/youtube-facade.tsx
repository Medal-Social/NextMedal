'use client';

import Image from 'next/image';
import { useId, useState } from 'react';

interface YouTubeFacadeProps {
  videoId: string;
  title: string;
  thumbnailUrl: string | null;
  playLabel: string;
}

/**
 * Privacy-friendly YouTube embed: show a static thumbnail until the user
 * clicks, then load youtube-nocookie.com (no cookies until interaction).
 */
export function YouTubeFacade({ videoId, title, thumbnailUrl, playLabel }: YouTubeFacadeProps) {
  const [active, setActive] = useState(false);
  const titleId = useId();
  const thumb = thumbnailUrl ?? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

  if (active) {
    return (
      <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-black">
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}?autoplay=1&rel=0`}
          title={title}
          className="absolute inset-0 h-full w-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
        />
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setActive(true)}
      className="group relative aspect-video w-full overflow-hidden rounded-lg bg-muted text-start focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      aria-labelledby={titleId}
    >
      <Image
        src={thumb}
        alt=""
        fill
        className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
        sizes="(max-width: 768px) 100vw, 640px"
        unoptimized={thumb.includes('ytimg.com') || thumb.includes('img.youtube.com')}
      />
      <span className="absolute inset-0 bg-black/25 transition-colors group-hover:bg-black/35" />
      <span className="absolute inset-0 flex items-center justify-center" aria-hidden>
        <span className="flex pointer-coarse:size-16 size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform group-hover:scale-105">
          <svg viewBox="0 0 24 24" className="ms-0.5 size-7 fill-current" aria-hidden>
            <path d="M8 5v14l11-7z" />
          </svg>
        </span>
      </span>
      <span id={titleId} className="sr-only">
        {playLabel}: {title}
      </span>
    </button>
  );
}
