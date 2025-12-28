'use client';

import dynamic from 'next/dynamic';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { Section } from '@/components/ui/section';
import moduleProps from '@/lib/moduleProps';
import { urlFor } from '@/sanity/lib/image';
import '@mux/mux-player/themes/classic';

const MuxPlayerReact = dynamic(() => import('@mux/mux-player-react'), {
  loading: () => (
    <div className="w-full h-full bg-muted flex flex-col items-center justify-center">
      <div className="w-16 h-16 rounded-full border-4 border-transparent border-t-primary animate-spin mb-4" />
      <p className="text-foreground font-medium text-lg">Preparing your video...</p>
      <p className="text-muted-foreground text-sm mt-1">High quality experience loading</p>
    </div>
  ),
  ssr: false,
});

// Extract YouTube video ID from various URL formats
function getYouTubeVideoId(url: string): string {
  if (!url) return '';

  // If it's already just an ID (no slashes or dots)
  if (!url.includes('/') && !url.includes('.')) {
    return url;
  }

  try {
    const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
    const hostname = urlObj.hostname.toLowerCase();
    const allowedDomains = ['youtube.com', 'www.youtube.com', 'm.youtube.com', 'youtu.be'];

    if (!allowedDomains.includes(hostname)) {
      return '';
    }

    let videoId = '';
    if (hostname === 'youtu.be') {
      videoId = urlObj.pathname.slice(1);
    } else if (urlObj.pathname.includes('/watch')) {
      videoId = urlObj.searchParams.get('v') || '';
    } else if (urlObj.pathname.includes('/embed/')) {
      videoId = urlObj.pathname.split('/embed/')[1];
    } else if (urlObj.pathname.includes('/shorts/')) {
      videoId = urlObj.pathname.split('/shorts/')[1];
    }

    // Validate video ID format
    if (videoId && /^[a-zA-Z0-9_-]{11}$/.test(videoId.split('?')[0])) {
      return videoId;
    }
  } catch {
    return '';
  }

  return '';
}

// Check if string is a valid URL
function isValidYouTubeUrl(input: string): boolean {
  try {
    const urlObj = new URL(input.startsWith('http') ? input : `https://${input}`);
    const hostname = urlObj.hostname.toLowerCase();
    return (
      hostname === 'youtube.com' || hostname.endsWith('.youtube.com') || hostname === 'youtu.be'
    );
  } catch {
    return false;
  }
}

// YouTube video hook
function useYouTubeVideo(videoIdOrUrl?: string) {
  const [videoId, setVideoId] = useState<string | null>(null);
  const [youtubeUrl, setYoutubeUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!videoIdOrUrl) {
      setError('No YouTube video ID provided');
      return;
    }

    const extractedId = getYouTubeVideoId(videoIdOrUrl);

    if (extractedId) {
      setVideoId(extractedId);
      const isUrl = isValidYouTubeUrl(videoIdOrUrl);
      setYoutubeUrl(isUrl ? videoIdOrUrl : `https://www.youtube.com/watch?v=${extractedId}`);
    } else if (videoIdOrUrl.startsWith('http')) {
      setYoutubeUrl(videoIdOrUrl);
    } else {
      setError('Could not extract YouTube video ID from URL');
    }
  }, [videoIdOrUrl]);

  return { videoId, youtubeUrl, error };
}

// Mux video hook
function useMuxVideo(data: Sanity.VideoHero) {
  const [videoId, setVideoId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const muxId = data.muxVideo?.asset?.playbackId || data.muxVideo?.playbackId || null;

    if (muxId) {
      setVideoId(muxId);
    } else {
      setError('No Mux playback ID found');
    }
  }, [data]);

  return { videoId, error };
}

// Get thumbnail URL from various sources
function getThumbnailUrl(
  data: Sanity.VideoHero,
  muxVideoId: string | null,
  youtubeVideoId: string | null
): string | null {
  type ThumbnailWithUrl = Sanity.Image & { src?: string };
  const thumbnailData = data?.thumbnail as ThumbnailWithUrl | undefined;

  // Try manual thumbnail first
  const manualUrl =
    thumbnailData?.src ||
    thumbnailData?.url ||
    (data?.thumbnail ? urlFor(data.thumbnail).url() : null);

  if (manualUrl) return manualUrl;

  // Fallback to automatic thumbnails
  if (data?.type === 'mux' && muxVideoId) {
    return `https://image.mux.com/${muxVideoId}/thumbnail.jpg?width=1920&height=1080&fit_mode=preserve`;
  }

  if (data?.type === 'youtube' && youtubeVideoId) {
    return `https://img.youtube.com/vi/${youtubeVideoId}/maxresdefault.jpg`;
  }

  return null;
}

// YouTube Player Component
function YouTubePlayer({ videoId, title }: { videoId: string; title?: string }) {
  const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;

  return (
    <div className="w-full h-full">
      <iframe
        src={embedUrl}
        title={title || 'YouTube video player'}
        className="w-full h-full border-0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      />
    </div>
  );
}

// Mux Player Component
function MuxVideoPlayer({
  playbackId,
  title,
  onError,
}: {
  playbackId: string;
  title?: string;
  onError: (err: unknown) => void;
}) {
  return (
    <MuxPlayerReact
      playbackId={playbackId}
      metadata={{
        video_title: title || 'Video',
        player_name: 'Medal Socials Player',
      }}
      theme="classic"
      accentColor="var(--color-brand-vibrant)"
      autoPlay
      style={{
        height: '100%',
        width: '100%',
        borderRadius: 'var(--radius)',
      }}
      onError={onError}
    />
  );
}

// Error Component
function VideoError({
  error,
  type,
  onBackClick,
}: {
  error: string | null;
  type?: string;
  onBackClick: () => void;
}) {
  return (
    <div className="flex items-center justify-center h-full bg-muted text-foreground text-center p-4">
      <div>
        <p className="text-xl font-semibold mb-2">Video Error</p>
        <p>{error || `Could not find a valid video ID for this ${type || ''} video.`}</p>
        <button
          type="button"
          onClick={onBackClick}
          className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded"
        >
          Back to Thumbnail
        </button>
      </div>
    </div>
  );
}

// Play button overlay
function PlayButtonOverlay() {
  return (
    <div className="absolute inset-0 bg-brand-navy/30 flex items-center justify-center">
      <span className="w-16 h-16 bg-brand-vibrant text-white rounded-full flex items-center justify-center transition-transform hover:scale-110">
        <svg className="w-8 h-8" viewBox="0 0 24 24">
          <title>Play video icon</title>
          <path d="M8 5v14l11-7z" fill="currentColor" />
        </svg>
      </span>
    </div>
  );
}

// Thumbnail view component
function ThumbnailView({
  thumbnailUrl,
  title,
  onPlay,
}: {
  thumbnailUrl: string | null;
  title?: string;
  onPlay: () => void;
}) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onPlay();
    }
  };

  return (
    <button
      type="button"
      className="relative w-full h-full cursor-pointer bg-muted"
      onClick={onPlay}
      aria-label="Play video"
      onKeyDown={handleKeyDown}
    >
      {thumbnailUrl ? (
        <Image
          src={thumbnailUrl}
          alt={title || 'Video thumbnail'}
          fill
          priority
          fetchPriority="high"
          className="object-cover"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
          <p>No thumbnail available</p>
        </div>
      )}
      <PlayButtonOverlay />
    </button>
  );
}

// Video player view
function PlayerView({
  data,
  youtube,
  mux,
  videoError,
  onBack,
  onError,
}: {
  data: Sanity.VideoHero;
  youtube: ReturnType<typeof useYouTubeVideo>;
  mux: ReturnType<typeof useMuxVideo>;
  videoError: string | null;
  onBack: () => void;
  onError: (err: unknown) => void;
}) {
  if (videoError) {
    return <VideoError error={videoError} type={data?.type} onBackClick={onBack} />;
  }

  if (data?.type === 'mux' && mux.videoId) {
    return <MuxVideoPlayer playbackId={mux.videoId} title={data.title} onError={onError} />;
  }

  if (data?.type === 'youtube' && youtube.videoId) {
    return <YouTubePlayer videoId={youtube.videoId} title={data.title} />;
  }

  return <VideoError error={null} type={data?.type} onBackClick={onBack} />;
}

export default function VideoHero({ data }: { data: Sanity.VideoHero }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const youtube = useYouTubeVideo(data?.type === 'youtube' ? data.videoId : undefined);
  const mux = useMuxVideo(data);

  const thumbnailUrl = getThumbnailUrl(data, mux.videoId, youtube.videoId);

  const handleError = (err: unknown) => {
    const message = err instanceof Error ? err.message : String(err);
    setError(`Video player error: ${message}`);
  };

  const videoError =
    error ||
    (data?.type === 'youtube' ? youtube.error : null) ||
    (data?.type === 'mux' ? mux.error : null);

  return (
    <Section
      width="full"
      spacing="none"
      className="relative w-full h-[80dvh] bg-muted"
      {...moduleProps(data)}
    >
      {/* SEO-friendly metadata */}
      <div className="hidden">
        <h1>{data?.title || 'Video'}</h1>
      </div>

      {!isPlaying ? (
        <ThumbnailView
          thumbnailUrl={thumbnailUrl}
          title={data?.title}
          onPlay={() => setIsPlaying(true)}
        />
      ) : (
        <div className="relative w-full h-full overflow-hidden bg-muted">
          <PlayerView
            data={data}
            youtube={youtube}
            mux={mux}
            videoError={videoError}
            onBack={() => setIsPlaying(false)}
            onError={handleError}
          />
        </div>
      )}
    </Section>
  );
}
