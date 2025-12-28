'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { urlFor } from '@/sanity/lib/image';
import { MuxVideoPlayer } from './video/MuxPlayer';
import { VideoError } from './video/VideoError';
import { YouTubePlayer } from './video/YouTubePlayer';

// Extract YouTube video ID from various URL formats
function getYouTubeVideoId(url: string): string {
  if (!url) return '';

  // Handle youtu.be format
  if (url.includes('youtu.be/')) {
    return url.split('youtu.be/')[1].split('?')[0];
  }

  // Handle youtube.com/watch?v= format
  if (url.includes('youtube.com/watch')) {
    try {
      const urlParams = new URLSearchParams(url.split('?')[1]);
      return urlParams.get('v') || '';
    } catch {
      return '';
    }
  }

  // Handle youtube.com/embed/ format
  if (url.includes('youtube.com/embed/')) {
    return url.split('youtube.com/embed/')[1].split('?')[0];
  }

  // If it's already just an ID (no slashes or dots)
  if (!url.includes('/') && !url.includes('.')) {
    return url;
  }

  return '';
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
      setYoutubeUrl(`https://www.youtube.com/watch?v=${extractedId}`);
    } else {
      setError('Could not extract YouTube video ID from URL');
    }
  }, [videoIdOrUrl]);

  return { videoId, youtubeUrl, error };
}

// Mux video hook
function useMuxVideo(data: Sanity.Video) {
  const [videoId, setVideoId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
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
}

// Play button overlay
function PlayButton() {
  return (
    <div className="absolute inset-0 bg-background/30 flex items-center justify-center">
      <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center">
        <svg className="w-8 h-8" viewBox="0 0 24 24">
          <title>Play video</title>
          <path d="M8 5v14l11-7z" fill="currentColor" />
        </svg>
      </div>
    </div>
  );
}

// Video thumbnail component
function VideoThumbnail({
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
          className="object-cover"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
          <p>No thumbnail available</p>
        </div>
      )}
      <PlayButton />
    </button>
  );
}

// Video player container
function VideoPlayer({
  data,
  youtube,
  mux,
  videoError,
  onBack,
  onError,
}: {
  data: Sanity.Video;
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

  if (data?.type === 'youtube' && youtube.youtubeUrl) {
    return <YouTubePlayer url={youtube.youtubeUrl} onError={onError} />;
  }

  return <VideoError error={null} type={data?.type} onBackClick={onBack} />;
}

export default function Video({ data, onClick }: { data: Sanity.Video; onClick?: () => void }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const youtube = useYouTubeVideo(data?.type === 'youtube' ? data.videoId : undefined);
  const mux = useMuxVideo(data);

  const thumbnailUrl = data?.thumbnail ? urlFor(data.thumbnail).url() : null;

  const handlePlayClick = () => {
    setIsPlaying(true);
    onClick?.();
  };

  const handleError = (err: unknown) => {
    const message = err instanceof Error ? err.message : String(err);
    setError(`Video player error: ${message}`);
  };

  const videoError =
    error ||
    (data?.type === 'youtube' ? youtube.error : null) ||
    (data?.type === 'mux' ? mux.error : null);

  return (
    <div className="relative w-full h-full bg-muted">
      {!isPlaying ? (
        <VideoThumbnail thumbnailUrl={thumbnailUrl} title={data?.title} onPlay={handlePlayClick} />
      ) : (
        <div className="relative w-full h-full overflow-hidden bg-muted">
          <VideoPlayer
            data={data}
            youtube={youtube}
            mux={mux}
            videoError={videoError}
            onBack={() => setIsPlaying(false)}
            onError={handleError}
          />
        </div>
      )}
    </div>
  );
}
