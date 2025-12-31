'use client';

import { motion, useReducedMotion } from 'motion/react';
import { stegaClean } from 'next-sanity';
import type { ReactNode } from 'react';
import SharedPortableText from '@/components/blocks/modules/SharedPortableText';
import { Img } from '@/components/blocks/objects/core';
import Video from '@/components/blocks/objects/core/Video';
import { CTAList } from '@/components/blocks/objects/cta';
import { Section } from '@/components/ui/section';
import moduleProps from '@/lib/sanity/module-props';
import { cn } from '@/lib/utils/index';

// Local type for MuxVideo to match Sanity.Hero interface
type MuxVideo = Sanity.Hero['muxVideo'];

// Helper to extract YouTube ID
function getYouTubeId(url: string | undefined): string | undefined {
  if (!url) return undefined;
  const match = url.match(/[?&]v=([^&]+)/);
  return match ? match[1] : undefined;
}

// Calculate media flags
function getMediaFlags(
  videoType: string,
  image?: { image?: Sanity.Image },
  muxVideo?: MuxVideo,
  videoUrl?: string
) {
  const hasImage = videoType === 'image' && !!image?.image;
  const hasMux = videoType === 'mux' && !!muxVideo?.asset?.playbackId;
  const hasYouTube = videoType === 'youtube' && !!videoUrl;
  const hasMedia = hasImage || hasMux || hasYouTube;
  return { hasImage, hasMux, hasYouTube, hasMedia };
}

// Calculate image aspect ratio
function getImageAspectRatio(
  hasImage: boolean,
  image?: { image?: Sanity.Image }
): number | undefined {
  if (!hasImage) return undefined;
  const imageAsset = image?.image?.asset as
    | { metadata?: { dimensions?: { width: number; height: number } } }
    | undefined;
  if (!imageAsset?.metadata?.dimensions) return undefined;
  return imageAsset.metadata.dimensions.width / imageAsset.metadata.dimensions.height;
}

// Build PortableText components
function buildPortableTextComponents(hasMedia: boolean) {
  return {
    block: {
      h1: ({ children }: { children?: ReactNode }) => (
        <h1
          className={cn(
            'text-5xl font-black tracking-tighter md:text-6xl lg:text-7xl mb-6 text-balance text-foreground',
            !hasMedia && 'mx-auto'
          )}
        >
          {children}
        </h1>
      ),
      normal: ({ children }: { children?: ReactNode }) => (
        <p
          className={cn(
            'text-lg md:text-xl text-muted-foreground leading-relaxed font-normal text-pretty max-w-2xl',
            !hasMedia && 'mx-auto'
          )}
        >
          {children}
        </p>
      ),
    },
    marks: {
      gradient: ({ children }: { children?: ReactNode }) => (
        <span className="inline-block bg-gradient-to-r from-brand-vibrant to-brand-purple bg-clip-text text-transparent dark:text-brand-400 font-extrabold">
          {children}
        </span>
      ),
      primary: ({ children }: { children?: ReactNode }) => (
        <span className="text-primary font-medium">{children}</span>
      ),
    },
  };
}

// Decorative background elements
function HeroBackground({ hasMedia }: { hasMedia: boolean }) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      <div className="absolute -top-[30%] -right-[10%] w-[70%] h-[70%] rounded-full bg-gradient-to-br from-[var(--hero-from)]/20 to-[var(--hero-to)]/20 blur-3xl opacity-70 dark:from-[var(--hero-from)]/5 dark:to-[var(--hero-to)]/5" />
      <div className="absolute -bottom-[20%] -left-[10%] w-[60%] h-[60%] rounded-full bg-gradient-to-tr from-brand-cyan/20 to-brand-rich/20 blur-3xl opacity-70 dark:from-brand-cyan/5 dark:to-brand-rich/5" />
      {!hasMedia && (
        <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-5 mix-blend-soft-light" />
      )}
    </div>
  );
}

// Hero image media
function HeroImage({ image }: { image: Sanity.Image }) {
  return (
    <Img
      image={image}
      className="absolute inset-0 w-full h-full object-contain"
      loading="eager"
      fetchPriority="high"
      fill
      sizes="(min-width: 1024px) 50vw, 100vw"
    />
  );
}

// Hero video media (Mux or YouTube)
function HeroVideo({
  type,
  muxVideo,
  videoUrl,
  thumbnail,
}: {
  type: 'mux' | 'youtube';
  muxVideo?: MuxVideo;
  videoUrl?: string;
  thumbnail?: Sanity.Image;
}) {
  if (type === 'mux' && muxVideo) {
    return (
      <Video
        data={{
          type: 'mux',
          muxVideo,
          thumbnail: thumbnail ? { _type: 'image', asset: thumbnail.asset } : undefined,
        }}
      />
    );
  }
  if (type === 'youtube' && videoUrl) {
    return (
      <Video
        data={{
          type: 'youtube',
          videoId: getYouTubeId(videoUrl),
          thumbnail: thumbnail ? { _type: 'image', asset: thumbnail.asset } : undefined,
        }}
      />
    );
  }
  return null;
}

// Hero media container
function HeroMedia({
  hasImage,
  hasMux,
  hasYouTube,
  image,
  muxVideo,
  videoUrl,
  imageAspectRatio,
  prefersReducedMotion,
}: {
  hasImage: boolean;
  hasMux: boolean;
  hasYouTube: boolean;
  image?: { image?: Sanity.Image };
  muxVideo?: MuxVideo;
  videoUrl?: string;
  imageAspectRatio?: number;
  prefersReducedMotion: boolean | null;
}) {
  const style = imageAspectRatio ? { aspectRatio: `${imageAspectRatio}` } : undefined;

  return (
    <motion.div
      initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={prefersReducedMotion ? { duration: 0 } : { delay: 0.2, duration: 0.5 }}
      className="lg:col-span-7"
    >
      <div
        className={cn(
          'relative w-full overflow-hidden rounded-2xl',
          !imageAspectRatio && 'aspect-video'
        )}
        style={style}
      >
        {hasImage && image?.image && <HeroImage image={image.image} />}
        {hasMux && <HeroVideo type="mux" muxVideo={muxVideo} thumbnail={image?.image} />}
        {hasYouTube && <HeroVideo type="youtube" videoUrl={videoUrl} thumbnail={image?.image} />}
      </div>
    </motion.div>
  );
}

// Hero content section
function HeroContent({
  content,
  ctas,
  hasMedia,
  components,
  prefersReducedMotion,
}: {
  content?: Sanity.BlockContent;
  ctas?: Sanity.CTA[];
  hasMedia: boolean;
  components: ReturnType<typeof buildPortableTextComponents>;
  prefersReducedMotion: boolean | null;
}) {
  return (
    <motion.div
      initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.5, ease: 'easeOut' }}
      className={cn(hasMedia && 'lg:col-span-5')}
    >
      <div className={cn(hasMedia ? 'space-y-8' : 'mx-auto items-center space-y-8')}>
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={prefersReducedMotion ? { duration: 0 } : { delay: 0.1, duration: 0.4 }}
        >
          {content && <SharedPortableText value={content} components={components} />}
        </motion.div>
        {ctas && ctas.length > 0 && (
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={prefersReducedMotion ? { duration: 0 } : { delay: 0.3, duration: 0.4 }}
            className={cn('flex flex-wrap gap-4', !hasMedia && 'justify-center')}
          >
            <CTAList
              className={cn('max-sm:min-w-full', !hasMedia && 'justify-center')}
              ctas={ctas}
              size="lg"
            />
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

export default function Hero(props: Sanity.Hero & { className?: string }) {
  const {
    className,
    content,
    ctas,
    image,
    options,
    videoType = 'image',
    muxVideo,
    videoUrl,
  } = props;
  const prefersReducedMotion = useReducedMotion();

  const bgFrom = stegaClean(options?.bgFrom) || 'brand-vibrant';
  const bgTo = stegaClean(options?.bgTo) || 'brand-purple';

  const { hasImage, hasMux, hasYouTube, hasMedia } = getMediaFlags(
    videoType,
    image,
    muxVideo,
    videoUrl
  );
  const imageAspectRatio = getImageAspectRatio(hasImage, image);
  const components = buildPortableTextComponents(hasMedia);

  return (
    <section
      className={cn('relative w-full overflow-hidden', className)}
      style={
        {
          '--hero-from': `var(--color-${bgFrom})`,
          '--hero-to': `var(--color-${bgTo})`,
        } as React.CSSProperties
      }
      {...moduleProps(props)}
    >
      <HeroBackground hasMedia={hasMedia} />
      <Section spacing="relaxed" className="relative z-10">
        <div
          className={cn(
            'grid grid-cols-1 gap-12',
            hasMedia ? 'lg:grid-cols-12 lg:items-start lg:gap-20' : 'max-w-5xl mx-auto text-center'
          )}
        >
          <HeroContent
            content={content}
            ctas={ctas}
            hasMedia={hasMedia}
            components={components}
            prefersReducedMotion={prefersReducedMotion}
          />
          {hasMedia && (
            <HeroMedia
              hasImage={hasImage}
              hasMux={hasMux}
              hasYouTube={hasYouTube}
              image={image}
              muxVideo={muxVideo}
              videoUrl={videoUrl}
              imageAspectRatio={imageAspectRatio}
              prefersReducedMotion={prefersReducedMotion}
            />
          )}
        </div>
      </Section>
    </section>
  );
}
