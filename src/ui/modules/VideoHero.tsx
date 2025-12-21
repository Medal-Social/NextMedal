'use client';

import dynamic from 'next/dynamic';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { Section } from '@/components/ui/section';
import { urlFor } from '@/sanity/lib/image';
import '@mux/mux-player/themes/classic';
// Define the structure of the Sanity data we receive
type SanityImage = {
  _type: 'image';
  asset: {
    _ref: string;
    _type: 'reference';
  };
  hotspot?: any;
  crop?: any;
};

// Define the VideoHero data structure
type VideoHero = {
  _type: 'videoHero';
  _key: string;
  type: 'mux' | 'youtube';
  videoId?: string;
  muxVideo?: {
    asset?: {
      playbackId?: string;
      data?: {
        playback_ids?: Array<{ id: string }>;
      };
    };
    playbackId?: string;
  };
  thumbnail?: SanityImage;
  title?: string;
};

// Use regular dynamic imports for video players
const MuxPlayer = dynamic(() => import('@mux/mux-player-react'), {
  loading: () => (
    <div className="w-full h-full bg-muted flex flex-col items-center justify-center">
      <div className="w-16 h-16 rounded-full border-4 border-transparent border-t-primary animate-spin mb-4" />
      <p className="text-foreground font-medium text-lg">Preparing your video...</p>
      <p className="text-muted-foreground text-sm mt-1">High quality experience loading</p>
    </div>
  ),
  ssr: false,
});

interface VideoHeroProps {
  data: VideoHero;
}

// -------------- Modular YouTube Utilities --------------

// Extract YouTube video ID from various URL formats
const getYouTubeVideoId = (url: string): string => {
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

    // Validate video ID to prevent open redirect
    if (videoId && /^[a-zA-Z0-9_-]{11}$/.test(videoId.split('?')[0])) {
      return videoId;
    }
  } catch (_e) {
    // Fallback to empty string if URL parsing fails
    return '';
  }

  return '';
};

// YouTube video hook for managing YouTube video state
const useYouTubeVideo = (videoIdOrUrl?: string) => {
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
      // If the input looks like a URL, use it directly to be safe, otherwise construct it
      const isUrl = videoIdOrUrl.includes('youtube.com') || videoIdOrUrl.includes('youtu.be');
      setYoutubeUrl(isUrl ? videoIdOrUrl : `https://www.youtube.com/watch?v=${extractedId}`);
    } else {
      // If extraction fails but it looks like a URL, try using it anyway
      if (videoIdOrUrl.includes('http')) {
        setYoutubeUrl(videoIdOrUrl);
      } else {
        setError('Could not extract YouTube video ID from URL');
      }
    }
  }, [videoIdOrUrl]);

  return { videoId, youtubeUrl, error };
};

// Mux video hook for managing Mux video state
const useMuxVideo = (data: VideoHero) => {
  const [videoId, setVideoId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Try to get the Mux ID from all possible locations in order of priority
    const muxId =
      data.muxVideo?.asset?.playbackId ||
      data.muxVideo?.asset?.data?.playback_ids?.[0]?.id ||
      data.muxVideo?.playbackId ||
      null;

    if (muxId) {
      setVideoId(muxId);
    } else {
      setError('No Mux playback ID found');
    }
  }, [data]);

  return { videoId, error };
};

// YouTube Player Component
const YouTubePlayer = ({ videoId, title }: { videoId: string; title?: string }) => {
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
};

// Mux Player Component
const MuxVideoPlayer = ({
  playbackId,
  title,
  onError,
}: {
  playbackId: string;
  title?: string;
  onError: (err: any) => void;
}) => {
  return (
    <MuxPlayer
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
};

// Error Component
const VideoError = ({
  error,
  type,
  onBackClick,
}: {
  error: string | null;
  type?: string;
  onBackClick: () => void;
}) => {
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
};

export default function VideoHero({ data }: VideoHeroProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handle different video types with custom hooks
  const youtube = useYouTubeVideo(data?.type === 'youtube' ? data.videoId : undefined);
  const mux = useMuxVideo(data);

  // Generate thumbnail URL
  let thumbnailUrl =
    (data?.thumbnail as any)?.src ||
    (data?.thumbnail as any)?.url ||
    (data?.thumbnail ? urlFor(data.thumbnail as any).url() : null);

  // Fallback to automatic thumbnails if manual one is missing
  if (!thumbnailUrl) {
    if (data?.type === 'mux' && mux.videoId) {
      thumbnailUrl = `https://image.mux.com/${mux.videoId}/thumbnail.jpg?width=1920&height=1080&fit_mode=preserve`;
    } else if (data?.type === 'youtube' && youtube.videoId) {
      thumbnailUrl = `https://img.youtube.com/vi/${youtube.videoId}/maxresdefault.jpg`;
    }
  }

  const handlePlayClick = () => {
    setIsPlaying(true);
  };

  const handleError = (err: any) => {
    setError(`Video player error: ${err}`);
  };

  // Combined error state
  const videoError =
    error ||
    (data?.type === 'youtube' ? youtube.error : null) ||
    (data?.type === 'mux' ? mux.error : null);

  return (
    <Section width="full" spacing="none" className="relative w-full h-[80dvh] bg-muted">
      {/* SEO-friendly metadata */}
      <div className="hidden">
        <h1>{data?.title || 'Video'}</h1>
      </div>

      {!isPlaying ? (
        // Thumbnail view
        <button
          type="button"
          className="relative w-full h-full cursor-pointer bg-muted"
          onClick={handlePlayClick}
          aria-label="Play video"
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handlePlayClick();
            }
          }}
        >
          {thumbnailUrl ? (
            <Image
              src={thumbnailUrl}
              alt={data?.title || 'Video thumbnail'}
              fill
              priority
              className="object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
              <p>No thumbnail available</p>
            </div>
          )}
          <div className="absolute inset-0 bg-brand-navy/30 flex items-center justify-center">
            <span className="w-16 h-16 bg-brand-vibrant text-white rounded-full flex items-center justify-center transition-transform hover:scale-110">
              {/* Play icon */}
              <svg className="w-8 h-8" viewBox="0 0 24 24">
                <title>Play video icon</title>
                <path d="M8 5v14l11-7z" fill="currentColor" />
              </svg>
            </span>
          </div>
        </button>
      ) : (
        // Video player
        <div className="relative w-full h-full overflow-hidden bg-muted">
          {videoError ? (
            <VideoError
              error={videoError}
              type={data?.type}
              onBackClick={() => setIsPlaying(false)}
            />
          ) : data?.type === 'mux' && mux.videoId ? (
            <MuxVideoPlayer playbackId={mux.videoId} title={data.title} onError={handleError} />
          ) : data?.type === 'youtube' && youtube.videoId ? (
            <YouTubePlayer videoId={youtube.videoId} title={data.title} />
          ) : (
            <VideoError error={null} type={data?.type} onBackClick={() => setIsPlaying(false)} />
          )}
        </div>
      )}
    </Section>
  );
}
