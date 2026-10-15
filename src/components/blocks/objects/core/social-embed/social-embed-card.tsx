import Image from 'next/image';
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

export interface SocialEmbedCardLabels {
  viewOn: string;
  playVideo: string;
  platformName: string;
  openOriginal: string;
}

interface SocialEmbedCardProps {
  data: SocialEmbedData;
  labels: SocialEmbedCardLabels;
  formattedDate?: string | null;
  className?: string;
}

function PlatformGlyph({ platform, className }: { platform: SocialPlatform; className?: string }) {
  const props = { className: cn('size-4', className), 'aria-hidden': true as const };
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

function Avatar({
  src,
  name,
  platform,
}: {
  src: string | null;
  name: string | null;
  platform: SocialPlatform;
}) {
  if (src) {
    return (
      <Image
        src={src}
        alt=""
        width={40}
        height={40}
        className="size-10 rounded-full object-cover"
        unoptimized
      />
    );
  }

  const initial = (name ?? labelsPlatformInitial(platform)).slice(0, 1).toUpperCase();
  return (
    <span
      className="flex size-10 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary text-sm"
      aria-hidden
    >
      {initial}
    </span>
  );
}

function labelsPlatformInitial(platform: SocialPlatform): string {
  return platform === 'x' ? 'X' : platform.charAt(0);
}

/**
 * Medal-branded static social card — no third-party widget scripts.
 */
export function SocialEmbedCard({ data, labels, formattedDate, className }: SocialEmbedCardProps) {
  const displayName = data.authorName ?? labels.platformName;
  const isYouTube = data.platform === 'youtube' && data.youtubeId && !data.isFallback;

  return (
    <article
      className={cn(
        'my-6 w-full max-w-xl overflow-hidden rounded-xl bg-card text-card-foreground shadow-[var(--card-shadow,0_1px_3px_rgb(0_0_0/0.08))]',
        className
      )}
      data-platform={data.platform}
      data-fallback={data.isFallback ? 'true' : undefined}
    >
      <div className="flex items-start gap-3 p-4">
        <Avatar src={data.authorAvatarUrl} name={data.authorName} platform={data.platform} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate font-semibold text-sm leading-tight">{displayName}</p>
            <span className="text-muted-foreground" aria-hidden>
              <PlatformGlyph platform={data.platform} />
            </span>
          </div>
          {(data.authorHandle || formattedDate) && (
            <p className="mt-0.5 truncate text-muted-foreground text-xs">
              {data.authorHandle}
              {data.authorHandle && formattedDate ? ' · ' : null}
              {formattedDate ? (
                <time dateTime={data.publishedAt ?? undefined}>{formattedDate}</time>
              ) : null}
            </p>
          )}
        </div>
        <span className="shrink-0 rounded-md bg-muted px-2 py-0.5 font-medium text-muted-foreground text-xs">
          {labels.platformName}
        </span>
      </div>

      {data.isFallback ? (
        <div className="space-y-3 px-4 pb-4">
          <p className="text-muted-foreground text-sm">{labels.openOriginal}</p>
          <a
            href={data.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 font-medium text-primary text-sm hover:underline"
          >
            {labels.viewOn}
            <ExternalLinkIcon />
          </a>
        </div>
      ) : (
        <>
          {(data.text || data.title) && !isYouTube && (
            <p className="whitespace-pre-wrap px-4 pb-3 text-sm leading-relaxed">
              {data.text ?? data.title}
            </p>
          )}

          {isYouTube && data.youtubeId ? (
            <div className="px-4 pb-4">
              {data.title ? (
                <p className="mb-2 line-clamp-2 font-medium text-sm">{data.title}</p>
              ) : null}
              <YouTubeFacade
                videoId={data.youtubeId}
                title={data.title ?? labels.platformName}
                thumbnailUrl={data.media?.url ?? null}
                playLabel={labels.playVideo}
              />
            </div>
          ) : null}

          {!isYouTube && data.media?.url ? (
            <div className="relative mx-4 mb-4 aspect-[1.91/1] overflow-hidden rounded-lg bg-muted">
              <Image
                src={data.media.url}
                alt={data.media.alt ?? ''}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 576px"
                unoptimized
              />
            </div>
          ) : null}

          <div className="border-border/60 border-t px-4 py-3">
            <a
              href={data.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 font-medium text-primary text-sm hover:underline"
            >
              {labels.viewOn}
              <ExternalLinkIcon />
            </a>
          </div>
        </>
      )}
    </article>
  );
}

function ExternalLinkIcon() {
  return (
    <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
      <path
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"
      />
    </svg>
  );
}
