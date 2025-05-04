'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

// Import Mux theme
import '@mux/mux-player/themes/classic';

// Dynamically import MuxPlayer to avoid server-side rendering issues
const MuxPlayer = dynamic(() => import('@mux/mux-player-react'), {
  loading: () => (
    <div className="absolute inset-0 flex flex-col items-center justify-center">
      <div className="w-16 h-16 rounded-full border-4 border-transparent border-t-primary animate-spin mb-4" />
      <p className="text-primary font-medium text-lg">Preparing your video...</p>
      <p className="text-muted-foreground text-sm mt-1">High quality experience loading</p>
    </div>
  ),
  ssr: false,
});

interface AutoPlayVideoProps {
  playbackId: string;
  className?: string;
  width?: number;
  height?: number;
  loop?: boolean;
  muted?: boolean;
}

export function AutoPlayVideo({
  playbackId,
  className = '',
  width: _width = 1200,
  height: _height,
  loop = true,
  muted = true,
}: AutoPlayVideoProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsMounted(true);
    return () => {
      setIsMounted(false);
    };
  }, []);

  if (!isMounted) {
    // Return a placeholder when not mounted
    return (
      <div className={`relative ${className}`} style={{ aspectRatio: '16/9' }}>
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/10">
          <div className="w-16 h-16 rounded-full border-4 border-transparent border-t-primary animate-spin mb-4" />
          <p className="text-primary font-medium text-lg">Preparing your video...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} style={{ aspectRatio: '16/9' }}>
      {isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/10">
          <div className="w-16 h-16 rounded-full border-4 border-transparent border-t-primary animate-spin mb-4" />
          <p className="text-primary font-medium text-lg">Preparing your video...</p>
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 p-4 text-center text-red-500">
          {error}
        </div>
      )}
      <MuxPlayer
        playbackId={playbackId}
        autoPlay="muted"
        loop={loop}
        muted={muted}
        preload="auto"
        thumbnailTime={0}
        theme="classic"
        accentColor="hsl(var(--primary))"
        onCanPlay={() => setIsLoading(false)}
        onPlaying={() => setError(null)}
        onError={(event) => {
          console.error('Mux Player Error:', event);
          setIsLoading(false);
          setError('Failed to load video. Please try again.');
        }}
        className={`h-full w-full object-cover ${isLoading ? 'invisible' : 'visible'}`}
        style={{
          aspectRatio: '16/9',
          borderRadius: 'var(--radius)',
        }}
      />
    </div>
  );
}
