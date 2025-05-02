'use client';

import { ResponsiveImg } from '@/ui/Img';
import { motion } from 'framer-motion';
import { Play } from 'lucide-react';
import { useState } from 'react';
import { VideoModal } from './video-modal';

interface VideoThumbnailProps {
  playbackId: string;
  image?: Sanity.Img;
  className?: string;
  width?: number;
  height?: number;
  title?: string;
}

export function VideoThumbnail({
  playbackId,
  image,
  className,
  width = 1200,
  height,
  title,
}: VideoThumbnailProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // If no image is provided, generate one from Mux
  const thumbnailUrl = image
    ? undefined
    : `https://image.mux.com/${playbackId}/thumbnail.jpg?width=${width}${height ? `&height=${height}` : ''}`;

  return (
    <>
      <motion.div
        className="group relative cursor-pointer overflow-hidden rounded-lg"
        whileHover="hover"
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        onClick={() => setIsModalOpen(true)}
      >
        {/* Thumbnail Image */}
        <motion.div
          className="relative w-full h-full"
          variants={{
            hover: { scale: 1.05 },
          }}
          transition={{ duration: 0.4 }}
        >
          {image ? (
            <ResponsiveImg
              img={image}
              width={width}
              height={height}
              className={`${className} transition-transform duration-300`}
              draggable={false}
            />
          ) : (
            <img
              src={thumbnailUrl}
              alt={title || 'Video thumbnail'}
              width={width}
              height={height}
              className={`w-full h-full object-cover ${className}`}
              draggable={false}
            />
          )}
        </motion.div>

        {/* Overlay with Play Button */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center bg-black/30"
          initial={{ opacity: 0.3 }}
          variants={{
            hover: { opacity: 0.5 },
          }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className="flex h-20 w-20 items-center justify-center rounded-full bg-white/90 text-primary shadow-xl"
            variants={{
              hover: {
                scale: 1.1,
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.4)',
              },
            }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            <Play className="h-10 w-10 ml-1" />
          </motion.div>
        </motion.div>

        {/* Optional Video Title Banner */}
        {title && (
          <motion.div
            className="absolute bottom-0 left-0 right-0 bg-black/70 px-4 py-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 10 }}
            transition={{ duration: 0.3 }}
          >
            <p className="text-white font-medium">{title}</p>
          </motion.div>
        )}
      </motion.div>

      <VideoModal
        playbackId={playbackId}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
