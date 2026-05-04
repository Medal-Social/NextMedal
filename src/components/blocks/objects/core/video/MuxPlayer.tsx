'use client';

import dynamic from 'next/dynamic';
import '@mux/mux-player/themes/classic';

const MuxPlayerReact = dynamic(() => import('@mux/mux-player-react').then((mod) => mod.default), {
  loading: () => (
    <div className="flex h-full w-full flex-col items-center justify-center bg-muted">
      <div className="mb-4 h-16 w-16 animate-spin rounded-full border-4 border-transparent border-t-primary" />
      <p className="font-medium text-foreground text-lg">Preparing your video...</p>
      <p className="mt-1 text-muted-foreground text-sm">High quality experience loading</p>
    </div>
  ),
  ssr: false,
});

interface MuxPlayerProps {
  playbackId: string;
  title?: string;
  onError: (err: unknown) => void;
}

export const MuxVideoPlayer = ({ playbackId, title, onError }: MuxPlayerProps) => {
  return (
    <MuxPlayerReact
      playbackId={playbackId}
      metadata={{
        video_title: title || 'Video',
        player_name: 'Medal Socials Player',
      }}
      theme="classic"
      accentColor="hsl(var(--primary))"
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
