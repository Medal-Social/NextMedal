'use client';

interface VideoErrorProps {
  error: string | null;
  type?: string;
  onBackClick: () => void;
}

export const VideoError = ({ error, type, onBackClick }: VideoErrorProps) => {
  return (
    <div className="flex items-center justify-center h-full bg-muted text-foreground text-center p-4">
      <div>
        <p className="text-xl font-semibold mb-2">Video Error</p>
        <p>{error || `Could not find a valid video ID for this ${type || ''} video.`}</p>
        <button
          onClick={onBackClick}
          type="button"
          className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded"
        >
          Back to Thumbnail
        </button>
      </div>
    </div>
  );
};
