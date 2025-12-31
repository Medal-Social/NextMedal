import { getImageDimensions } from '@sanity/asset-utils';
import Image, { type ImageProps } from 'next/image';
import { stegaClean } from 'next-sanity';
import type { ComponentProps } from 'react';
import { preload } from 'react-dom';
import { logger } from '@/lib/core/logger';
import { cn } from '@/lib/utils/index';
import { urlFor } from '@/sanity/lib/image';

type ImgProps = {
  alt?: string;
  // Next.js 16: use fetchPriority for LCP optimization
  fetchPriority?: 'high' | 'low' | 'auto';
} & Omit<ImageProps, 'src' | 'alt'>;

type DirectImage = Sanity.Image & { src?: string; width?: number; height?: number };

// Calculate dimensions maintaining aspect ratio
function calculateDimensions(
  originalWidth: number,
  originalHeight: number,
  targetWidth?: number | `${number}` | string,
  targetHeight?: number | `${number}` | string
) {
  const w = targetWidth ? Number(targetWidth) : undefined;
  const h = targetHeight ? Number(targetHeight) : undefined;

  const calcWidth = w || (h ? Math.floor((h * originalWidth) / originalHeight) : originalWidth);
  const calcHeight = h || (w ? Math.floor((w * originalHeight) / originalWidth) : originalHeight);

  return { width: calcWidth, height: calcHeight };
}

// Get valid loading value
function getValidLoading(
  loadingValue: string | undefined,
  priority?: boolean,
  loadingProp?: ImageProps['loading']
): ImageProps['loading'] | undefined {
  if (priority) return undefined;
  if (loadingProp) return loadingProp;
  if (loadingValue === 'eager' || loadingValue === 'lazy') return loadingValue;
  return 'lazy';
}

// Wrap image with data-sanity container if needed
function wrapWithSanityContainer(
  imageElement: React.ReactNode,
  dataSanity?: string,
  className?: string
) {
  if (!dataSanity) return imageElement;

  return (
    <div data-sanity={dataSanity} className={cn('relative h-full w-full', className)}>
      {imageElement}
    </div>
  );
}

// Render image from direct URL (mock/external)
function renderDirectImage(
  image: DirectImage,
  props: ImgProps & { 'data-sanity'?: string },
  targetWidth?: number | `${number}` | string,
  targetHeight?: number | `${number}` | string
) {
  const src = image.src || image.url || '';
  const originalWidth = image.width || 800;
  const originalHeight = image.height || 600;

  const { width, height } = calculateDimensions(
    originalWidth,
    originalHeight,
    targetWidth,
    targetHeight
  );

  const imageElement = (
    <Image src={src} width={width} height={height} alt={props.alt || image.alt || ''} {...props} />
  );

  return wrapWithSanityContainer(imageElement, props['data-sanity'], props.className);
}

export function ResponsiveImg({
  img,
  pictureProps,
  ...props
}: {
  img?: Sanity.Img;
  pictureProps?: ComponentProps<'picture'>;
} & ImgProps) {
  if (!img) return null;

  return (
    <picture {...pictureProps}>
      {img.responsive?.map((responsiveImg) => (
        <Source {...responsiveImg} key={responsiveImg.image?.url || responsiveImg.media} />
      ))}
      <Img image={img.image} {...props} />
    </picture>
  );
}

export function Img({
  image,
  width: w,
  height: h,
  loading: loadingProp,
  ...props
}: {
  image?: DirectImage;
} & ImgProps & { 'data-sanity'?: string }) {
  if (!image) return null;

  // Handle direct URL (mock/external)
  if (image.src || image.url) {
    return renderDirectImage(image, props, w, h);
  }

  const generatedSrc = generateSrc(image, w, h);
  if (!generatedSrc) return null;

  const { src, width, height } = generatedSrc;
  const isGif = src.includes('.gif');
  const isSvg = src.toLowerCase().endsWith('.svg');

  const loadingValue = stegaClean(image.loading);
  const validLoading = getValidLoading(loadingValue, props.priority, loadingProp);

  if (validLoading === 'eager') {
    preload(src, { as: 'image' });
  }

  // Use LQIP (Low Quality Image Placeholder) from Sanity metadata for blur-up effect
  // Asset may have extended metadata from GROQ projection
  const asset = image.asset as { metadata?: { lqip?: string } } | undefined;
  const lqip = asset?.metadata?.lqip;
  const blurProps =
    lqip && !isGif && !isSvg
      ? {
          placeholder: 'blur' as const,
          blurDataURL: lqip,
        }
      : {};

  const imageElement = (
    <Image
      src={isGif ? src.split('?')[0] : src}
      width={props.fill ? undefined : width}
      height={props.fill ? undefined : height}
      alt={props.alt || image.alt || image.altText || image.asset?.altText || ''}
      unoptimized={isGif || isSvg}
      {...blurProps}
      {...props}
      loading={validLoading}
    />
  );

  return wrapWithSanityContainer(imageElement, props['data-sanity'], props.className);
}

export function Source({
  image,
  media = '(width < 48rem)',
  width: w,
  height: h,
  ...props
}: {
  image?: Sanity.Image;
} & ComponentProps<'source'>) {
  if (!image) return null;
  const generatedSrc = generateSrc(image, w, h);

  if (!generatedSrc) return null;

  const { src, width, height } = generatedSrc;

  const loadingValue = stegaClean(image.loading);
  const validLoading = loadingValue === 'eager' || loadingValue === 'lazy' ? loadingValue : 'lazy';

  if (validLoading === 'eager') {
    preload(src, { as: 'image' });
  }

  return <source srcSet={src} width={width} height={height} media={media} {...props} />;
}

function generateSrc(
  image: Sanity.Image,
  w?: number | `${number}` | string,
  h?: number | `${number}` | string
) {
  try {
    const { width: originalWidth, height: originalHeight } = getImageDimensions(
      image as Parameters<typeof getImageDimensions>[0]
    );

    const { width, height } = calculateDimensions(originalWidth, originalHeight, w, h);

    return {
      src: urlFor(image)
        .withOptions({
          width: w ? Number(w) : undefined,
          height: h ? Number(h) : undefined,
          auto: 'format',
        })
        .url(),
      width,
      height,
    };
  } catch (error) {
    logger.error({ error, image }, 'Error generating src');
    return null;
  }
}
