'use client';

interface VideoErrorProps {
  error: string | null;
  type?: string;
  onBackClick: () => void;
}

export const VideoError = ({ error, type, onBackClick }: VideoErrorProps) => {
  return (
    <div className="flex h-full items-center justify-center bg-muted p-4 text-center text-foreground">
      <div>
        <p className="mb-2 font-semibold text-xl">Video Error</p>
        <p>{error || `Could not find a valid video ID for this ${type || ''} video.`}</p>
        <button
          onClick={onBackClick}
          type="button"
          className="mt-4 rounded bg-primary px-4 py-2 text-primary-foreground"
        >
          Back to Thumbnail
        </button>
      </div>
    </div>
  );
};
