import {
  IconInstagram,
  IconLinkedin,
  IconThreads,
  IconTiktok,
  IconTwitterX,
  IconYoutube,
} from '@/components/icons/social-icons';
import type { SocialEmbedData, SocialPlatform } from '@/lib/social-embed';
import { cn } from '@/lib/utils/index';
import { YouTubeFacade } from './youtube-facade';

/**
 * Sized <img> (not next/image) so social cards stay pure RSC with no
 * image-component client island — required for the mobile Lighthouse gate.
 * Width/height + parent aspect-ratio reserve space (zero CLS).
 */
function SizedImg({
  src,
  alt,
  width,
  height,
  className,
  sizes,
}: {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  sizes?: string;
}) {
  return (
    // biome-ignore lint/performance/noImgElement: intentional — avoids next/image client JS on RSC cards
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      sizes={sizes}
      loading="lazy"
      decoding="async"
    />
  );
}

export interface SocialEmbedCardLabels {
  viewOn: string;
  playVideo: string;
  platformName: string;
  openOriginal: string;
  fallbackTitle: string;
  fallbackDescription: string;
  clickToPlay: string;
  postOn: string;
}

interface SocialEmbedCardProps {
  data: SocialEmbedData;
  labels: SocialEmbedCardLabels;
  formattedDate?: string | null;
  className?: string;
}

const EXTERNAL_REL = 'noopener noreferrer nofollow ugc';

function PlatformGlyph({ platform, className }: { platform: SocialPlatform; className?: string }) {
  const props = { className: cn('size-[15px]', className), 'aria-hidden': true as const };
  switch (platform) {
    case 'x':
      return <IconTwitterX {...props} />;
    case 'linkedin':
      return <IconLinkedin {...props} />;
    case 'instagram':
      return <IconInstagram {...props} />;
    case 'threads':
      return <IconThreads {...props} />;
    case 'tiktok':
      return <IconTiktok {...props} />;
    case 'youtube':
      return <IconYoutube {...props} />;
    default:
      return null;
  }
}

function mediaAlt(data: SocialEmbedData, platformName: string): string {
  if (data.media?.alt?.trim()) return data.media.alt.trim();
  if (data.linkPreview?.image?.alt?.trim()) return data.linkPreview.image.alt.trim();
  if (data.title?.trim()) return data.title.trim();
  if (data.text?.trim()) {
    const clipped = data.text.trim().replace(/\s+/g, ' ');
    return clipped.length > 120 ? `${clipped.slice(0, 117)}…` : clipped;
  }
  if (data.authorName?.trim()) return `${data.authorName} on ${platformName}`;
  return `${platformName} post`;
}

function Avatar({
  src,
  name,
  platform,
  square,
}: {
  src: string | null;
  name: string | null;
  platform: SocialPlatform;
  square?: boolean;
}) {
  const initial = (name ?? (platform === 'x' ? 'X' : platform.charAt(0))).slice(0, 1).toUpperCase();
  const shape = square ? 'rounded-[10px]' : 'rounded-full';

  if (src) {
    return (
      <SizedImg
        src={src}
        alt=""
        width={42}
        height={42}
        className={cn('size-[42px] shrink-0 object-cover', shape)}
      />
    );
  }

  return (
    <span
      className={cn(
        'grid size-[42px] shrink-0 place-items-center bg-brand-800 font-semibold text-[15px] text-white',
        shape
      )}
      aria-hidden
    >
      {initial}
    </span>
  );
}

function ExternalLinkIcon() {
  return (
    <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
      <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M9 7h8v8" />
    </svg>
  );
}

function ViewOnLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel={EXTERNAL_REL}
      className="inline-flex items-center gap-1.5 font-semibold text-[13px] text-brand-600 no-underline hover:underline dark:text-brand-300"
    >
      {label}
      <ExternalLinkIcon />
    </a>
  );
}

function CardFooter({
  dateLabel,
  dateTime,
  viewHref,
  viewLabel,
}: {
  dateLabel: string | null;
  dateTime: string | null;
  viewHref: string;
  viewLabel: string;
}) {
  let stamp: React.ReactNode = <span />;
  if (dateLabel && dateTime) {
    stamp = <time dateTime={dateTime}>{dateLabel}</time>;
  } else if (dateLabel) {
    stamp = <span>{dateLabel}</span>;
  }

  return (
    <div className="mt-3.5 flex items-center justify-between border-border border-t pt-3 text-[13px] text-muted-foreground">
      {stamp}
      <ViewOnLink href={viewHref} label={viewLabel} />
    </div>
  );
}

function GlyphBadge({
  platform,
  platformName,
}: {
  platform: SocialPlatform;
  platformName: string;
}) {
  return (
    <span
      className="grid size-[30px] shrink-0 place-items-center rounded-[9px] bg-muted text-foreground"
      title={platformName}
    >
      <PlatformGlyph platform={platform} />
      <span className="sr-only">{platformName}</span>
    </span>
  );
}

function hostPathLabel(url: string): string {
  try {
    const parsed = new URL(url);
    const host = parsed.host.replace(/^www\./, '');
    return parsed.pathname.length > 1 ? `${host}${parsed.pathname}` : host;
  } catch {
    return url;
  }
}

function FallbackBody({ data, labels }: { data: SocialEmbedData; labels: SocialEmbedCardLabels }) {
  return (
    <>
      <div className="flex items-start gap-3.5">
        <div
          className="grid size-[38px] shrink-0 place-items-center rounded-[10px] border border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300"
          aria-hidden
        >
          <svg
            className="size-[18px]"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            aria-hidden
          >
            <circle cx="12" cy="12" r="9" strokeWidth="2" />
            <path strokeWidth="2" strokeLinecap="round" d="M12 8v4M12 16h.01" />
          </svg>
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-[15px] leading-snug">{labels.fallbackTitle}</p>
          <p className="mt-1 text-[13.5px] text-muted-foreground leading-snug">
            {labels.fallbackDescription}
          </p>
          <p className="mt-2.5 truncate rounded-lg border border-border bg-background px-2.5 py-1.5 font-mono text-[12px] text-foreground">
            {hostPathLabel(data.url)}
          </p>
        </div>
        <GlyphBadge platform={data.platform} platformName={labels.platformName} />
      </div>
      <CardFooter
        dateLabel={labels.postOn}
        dateTime={null}
        viewHref={data.url}
        viewLabel={labels.viewOn}
      />
    </>
  );
}

function LinkPreviewFigure({
  data,
  labels,
}: {
  data: SocialEmbedData;
  labels: SocialEmbedCardLabels;
}) {
  const preview = data.linkPreview;
  if (!preview) return null;

  return (
    <figure className="mt-3.5 overflow-hidden rounded-xl border border-border">
      {preview.image?.url ? (
        <div
          className="w-full overflow-hidden bg-muted"
          style={{ aspectRatio: preview.image.aspectRatio ?? '1.91 / 1' }}
        >
          <SizedImg
            src={preview.image.url}
            alt={preview.image.alt?.trim() || preview.title || mediaAlt(data, labels.platformName)}
            width={preview.image.width ?? 600}
            height={preview.image.height ?? 314}
            className="h-full w-full object-cover"
            sizes="(max-width: 768px) 100vw, 576px"
          />
        </div>
      ) : (
        <div className="aspect-[1.91/1] w-full bg-muted" aria-hidden />
      )}
      <figcaption className="border-border border-t px-3 pt-2.5 pb-3">
        {preview.domain ? (
          <p className="text-[12.5px] text-muted-foreground">{preview.domain}</p>
        ) : null}
        {preview.title ? (
          <p className="mt-0.5 font-semibold text-[14.5px] leading-snug">{preview.title}</p>
        ) : null}
        {preview.description ? (
          <p className="mt-1 line-clamp-2 text-[13px] text-muted-foreground leading-snug">
            {preview.description}
          </p>
        ) : null}
      </figcaption>
    </figure>
  );
}

function RichBody({
  data,
  labels,
  formattedDate,
}: {
  data: SocialEmbedData;
  labels: SocialEmbedCardLabels;
  formattedDate?: string | null;
}) {
  const displayName = data.authorName ?? labels.platformName;
  const isYouTube = Boolean(data.platform === 'youtube' && data.youtubeId);
  const bodyText = data.text ?? data.title;

  return (
    <>
      <header className="flex items-center gap-3">
        <Avatar
          src={data.authorAvatarUrl}
          name={data.authorName}
          platform={data.platform}
          square={data.platform === 'linkedin'}
        />
        <div className="min-w-0 flex-1 leading-tight">
          <p className="truncate font-semibold text-[15px]">{displayName}</p>
          {data.authorHandle ? (
            <p className="truncate text-[13.5px] text-muted-foreground">{data.authorHandle}</p>
          ) : null}
        </div>
        <GlyphBadge platform={data.platform} platformName={labels.platformName} />
      </header>

      {bodyText && !isYouTube ? (
        <blockquote className="mt-3.5 whitespace-pre-line text-[15px] leading-normal">
          {bodyText}
        </blockquote>
      ) : null}

      {isYouTube && data.youtubeId ? (
        <figure className="mt-3.5">
          <YouTubeFacade
            videoId={data.youtubeId}
            title={data.title ?? labels.platformName}
            thumbnailUrl={data.media?.url ?? null}
            playLabel={labels.playVideo}
            clickToPlayLabel={labels.clickToPlay}
          />
          {data.title ? <figcaption className="sr-only">{data.title}</figcaption> : null}
        </figure>
      ) : null}

      {!isYouTube ? <LinkPreviewFigure data={data} labels={labels} /> : null}

      {!isYouTube && !data.linkPreview && data.media?.url ? (
        <figure
          className="mt-3.5 w-full overflow-hidden rounded-xl bg-muted"
          style={{ aspectRatio: data.media.aspectRatio ?? '1 / 1' }}
        >
          <SizedImg
            src={data.media.url}
            alt={mediaAlt(data, labels.platformName)}
            width={data.media.width ?? 600}
            height={data.media.height ?? 600}
            className="h-full w-full object-cover"
            sizes="(max-width: 768px) 100vw, 576px"
          />
        </figure>
      ) : null}

      <CardFooter
        dateLabel={formattedDate ?? null}
        dateTime={data.publishedAt}
        viewHref={data.url}
        viewLabel={labels.viewOn}
      />
    </>
  );
}

/**
 * Medal-branded static social card — matches the approved mockup layout.
 * No third-party widget scripts. Pure RSC (YouTube uses a zero-JS
 * details/summary facade).
 */
export function SocialEmbedCard({ data, labels, formattedDate, className }: SocialEmbedCardProps) {
  return (
    <article
      className={cn(
        'my-6 w-full max-w-xl rounded-2xl border border-border bg-card p-[18px] pb-3.5 text-card-foreground shadow-[0_1px_2px_rgba(10,0,24,0.04)] dark:shadow-none',
        className
      )}
      data-platform={data.platform}
      data-fallback={data.isFallback ? 'true' : undefined}
    >
      {data.isFallback ? (
        <FallbackBody data={data} labels={labels} />
      ) : (
        <RichBody data={data} labels={labels} formattedDate={formattedDate} />
      )}
    </article>
  );
}
