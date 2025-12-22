'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { urlFor } from '@/sanity/lib/image';
import { MuxVideoPlayer } from './video/MuxPlayer';
import { VideoError } from './video/VideoError';
import { YouTubePlayer } from './video/YouTubePlayer';

// -------------- Modular YouTube Utilities --------------

// Extract YouTube video ID from various URL formats
const getYouTubeVideoId = (url: string): string => {
  if (!url) return '';

  // Handle youtu.be format
  if (url.includes('youtu.be/')) {
    const id = url.split('youtu.be/')[1];
    return id.split('?')[0];
  }

  // Handle youtube.com/watch?v= format
  if (url.includes('youtube.com/watch')) {
    try {
      const urlParams = new URLSearchParams(url.split('?')[1]);
      return urlParams.get('v') || '';
    } catch (_) {
      return '';
    }
  }

  // Handle youtube.com/embed/ format
  if (url.includes('youtube.com/embed/')) {
    const id = url.split('youtube.com/embed/')[1];
    return id.split('?')[0];
  }

  // If it's already just an ID (no slashes or dots)
  if (!url.includes('/') && !url.includes('.')) {
    return url;
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
      setYoutubeUrl(`https://www.youtube.com/watch?v=${extractedId}`);
    } else {
      setError('Could not extract YouTube video ID from URL');
    }
  }, [videoIdOrUrl]);

  return { videoId, youtubeUrl, error };
};

// Mux video hook for managing Mux video state
const useMuxVideo = (data: Sanity.Video) => {
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

export default function Video({ data, onClick }: { data: Sanity.Video; onClick?: () => void }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handle different video types with custom hooks
  const youtube = useYouTubeVideo(data?.type === 'youtube' ? data.videoId : undefined);
  const mux = useMuxVideo(data);

  // Generate thumbnail URL
  const thumbnailUrl = data?.thumbnail ? urlFor(data.thumbnail as any).url() : null;

  const handlePlayClick = () => {
    setIsPlaying(true);
    onClick?.();
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
    <div className="relative w-full h-full bg-muted">
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
          <div className="absolute inset-0 bg-background/30 flex items-center justify-center">
            <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center">
              {/* Play icon */}
              <svg className="w-8 h-8" viewBox="0 0 24 24">
                <title>Play video</title>
                <path d="M8 5v14l11-7z" fill="currentColor" />
              </svg>
            </div>
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
          ) : data?.type === 'youtube' && youtube.youtubeUrl ? (
            <YouTubePlayer url={youtube.youtubeUrl} onError={handleError} />
          ) : (
            <VideoError error={null} type={data?.type} onBackClick={() => setIsPlaying(false)} />
          )}
        </div>
      )}
    </div>
  );
}
