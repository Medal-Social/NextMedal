interface YouTubeFacadeProps {
  videoId: string;
  title: string;
  thumbnailUrl: string | null;
  playLabel: string;
  clickToPlayLabel?: string;
}

/**
 * Privacy-friendly YouTube embed with zero client JS.
 * Closed `<details>` shows a static poster; opening it reveals the
 * youtube-nocookie iframe (browsers defer loading while closed).
 * Pure RSC — no next/image client island.
 */
export function YouTubeFacade({
  videoId,
  title,
  thumbnailUrl,
  playLabel,
  clickToPlayLabel,
}: YouTubeFacadeProps) {
  const thumb = thumbnailUrl ?? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
  // Accessible name matches the visible title overlay so axe
  // label-content-name-mismatch stays green; playLabel is included for SR context.
  const accessibleName = clickToPlayLabel ? `${title} ${clickToPlayLabel}` : title;

  return (
    <details className="group relative aspect-video w-full overflow-hidden rounded-xl bg-muted open:bg-black">
      <summary
        className="absolute inset-0 z-10 cursor-pointer list-none text-start marker:content-none focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 [&::-webkit-details-marker]:hidden"
        aria-label={`${playLabel}: ${accessibleName}`}
      >
        {/*
          Visible title text is duplicated in aria-label (above). Decorative
          poster uses empty alt; chrome wraps in a presentational group.
        */}
        <span className="pointer-events-none absolute inset-0" aria-hidden="true">
          {/* biome-ignore lint/performance/noImgElement: intentional — avoids next/image client JS */}
          <img
            src={thumb}
            alt=""
            width={640}
            height={360}
            className="h-full w-full object-cover transition-transform duration-300 group-open:opacity-0 group-hover:scale-[1.02]"
            sizes="(max-width: 768px) 100vw, 640px"
            loading="lazy"
            decoding="async"
          />
          <span className="absolute inset-x-0 top-0 bg-linear-to-b from-black/65 to-transparent px-3.5 py-3 font-semibold text-[13.5px] text-white group-open:hidden">
            {title}
          </span>
          <span className="absolute inset-0 flex items-center justify-center group-open:hidden">
            <span className="grid h-12 w-[68px] place-items-center rounded-[14px] bg-brand-800 shadow-[0_6px_20px_rgba(10,0,24,0.35)] transition-transform group-hover:scale-105 dark:bg-brand-500">
              <svg viewBox="0 0 24 24" className="ms-0.5 size-[22px] fill-white" aria-hidden>
                <path d="M6 4l14 8-14 8z" />
              </svg>
            </span>
          </span>
          {clickToPlayLabel ? (
            <span className="absolute start-3 bottom-2.5 rounded-md bg-black/70 px-1.5 py-0.5 text-[11.5px] text-white group-open:hidden">
              {clickToPlayLabel}
            </span>
          ) : null}
        </span>
      </summary>
      <iframe
        src={`https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}?rel=0`}
        title={title}
        className="absolute inset-0 z-0 h-full w-full border-0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        loading="lazy"
        referrerPolicy="strict-origin-when-cross-origin"
      />
    </details>
  );
}
