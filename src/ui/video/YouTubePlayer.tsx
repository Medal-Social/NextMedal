'use client';

import dynamic from 'next/dynamic';

const ReactPlayer = dynamic(() => import('react-player'), {
  loading: () => (
    <div className="w-full h-full bg-muted flex flex-col items-center justify-center">
      <div className="w-16 h-16 rounded-full border-4 border-transparent border-t-primary animate-spin mb-4" />
      <p className="text-foreground font-medium text-lg">Loading your content...</p>
      <p className="text-muted-foreground text-sm mt-1">YouTube player is being prepared</p>
    </div>
  ),
  ssr: false,
}) as any;

interface YouTubePlayerProps {
  url: string;
  onError: (err: any) => void;
}

export const YouTubePlayer = ({ url, onError }: YouTubePlayerProps) => {
  return (
    <div className="w-full h-full">
      <ReactPlayer url={url} width="100%" height="100%" playing controls onError={onError} />
    </div>
  );
};
