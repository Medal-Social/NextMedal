'use client';

import dynamic from 'next/dynamic';
import '@mux/mux-player/themes/classic';

const MuxPlayerReact = dynamic(() => import('@mux/mux-player-react').then((mod) => mod.default), {
  loading: () => (
    <div className="w-full h-full bg-muted flex flex-col items-center justify-center">
      <div className="w-16 h-16 rounded-full border-4 border-transparent border-t-primary animate-spin mb-4" />
      <p className="text-foreground font-medium text-lg">Preparing your video...</p>
      <p className="text-muted-foreground text-sm mt-1">High quality experience loading</p>
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
