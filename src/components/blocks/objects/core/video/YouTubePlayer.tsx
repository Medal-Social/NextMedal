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
      <div className="flex h-full w-full flex-col items-center justify-center bg-muted">
        <div className="mb-4 h-16 w-16 animate-spin rounded-full border-4 border-transparent border-t-primary" />
        <p className="font-medium text-foreground text-lg">Loading your content...</p>
        <p className="mt-1 text-muted-foreground text-sm">YouTube player is being prepared</p>
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
    <div className="h-full w-full">
      <ReactPlayer url={url} width="100%" height="100%" playing controls onError={onError} />
    </div>
  );
};
