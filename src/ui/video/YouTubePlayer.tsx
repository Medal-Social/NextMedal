'use client';

import dynamic from 'next/dynamic';

import type { ComponentType } from 'react';

interface ReactPlayerProps {
  url: string;
  width: string;
  height: string;
  playing: boolean;
  controls: boolean;
  onError: (err: unknown) => void;
}

const ReactPlayer = dynamic(
  () => import('react-player') as Promise<{ default: ComponentType<ReactPlayerProps> }>,
  {
    loading: () => (
      <div className="w-full h-full bg-muted flex flex-col items-center justify-center">
        <div className="w-16 h-16 rounded-full border-4 border-transparent border-t-primary animate-spin mb-4" />
        <p className="text-foreground font-medium text-lg">Loading your content...</p>
        <p className="text-muted-foreground text-sm mt-1">YouTube player is being prepared</p>
      </div>
    ),
    ssr: false,
  }
);

interface YouTubePlayerProps {
  url: string;
  onError: (err: unknown) => void;
}

export const YouTubePlayer = ({ url, onError }: YouTubePlayerProps) => {
  return (
    <div className="w-full h-full">
      <ReactPlayer url={url} width="100%" height="100%" playing controls onError={onError} />
    </div>
  );
};
