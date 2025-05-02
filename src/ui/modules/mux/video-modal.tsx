'use client';

import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

// Dynamically import MuxPlayer to avoid server-side rendering issues
const MuxPlayer = dynamic(() => import('@mux/mux-player-react'), {
  loading: () => (
    <div className="absolute inset-0 flex items-center justify-center">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
    </div>
  ),
  ssr: false,
});

interface VideoModalProps {
  playbackId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function VideoModal({ playbackId, isOpen, onClose }: VideoModalProps) {
  const [shouldRender, setShouldRender] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      setIsLoading(true);
      setError(null);
    } else {
      // Reset states when modal is closed
      setShouldRender(false);
      setIsLoading(true);
      setError(null);
    }
  }, [isOpen]);

  const handleClose = () => {
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent
        className="bg-black/80 max-h-[95vh] h-auto max-w-7xl overflow-hidden p-0 border-none shadow-xl w-[100vw]"
        aria-label="Video player"
      >
        <DialogTitle className="sr-only">Video player</DialogTitle>
        <DialogDescription className="sr-only">Video player</DialogDescription>
        <div className="relative flex h-full w-full min-h-[200px] items-center justify-center">
          {shouldRender && (
            <div className="h-full w-full">
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 className="h-12 w-12 animate-spin text-primary" />
                </div>
              )}
              {error && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 p-4 text-center text-red-500">
                  {error}
                </div>
              )}
              <MuxPlayer
                playbackId={playbackId}
                autoPlay="any"
                muted={false}
                onCanPlay={() => setIsLoading(false)}
                onPlaying={() => setError(null)}
                onError={(event) => {
                  console.error('Mux Player Error:', event);
                  setIsLoading(false);
                  setError('Failed to load video. Please try again.');
                }}
                className={`h-full w-full ${isLoading ? 'invisible' : 'visible'}`}
                style={{
                  aspectRatio: '16/9',
                  maxHeight: 'calc(95vh - 2rem)',
                  width: '100%',
                }}
              />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
