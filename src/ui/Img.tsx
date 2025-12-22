import { getImageDimensions } from '@sanity/asset-utils';
import Image, { type ImageProps } from 'next/image';
import { stegaClean } from 'next-sanity';
import type { ComponentProps } from 'react';
import { preload } from 'react-dom';
import { urlFor } from '@/sanity/lib/image';

type ImgProps = { alt?: string } & Omit<ImageProps, 'src' | 'alt'>;

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
    <picture {...(pictureProps as any)}>
      {img.responsive?.map((r) => (
        <Source {...r} key={(r.image as any).url || r.media} />
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
  image?: any;
} & ImgProps) {
  if (!image) return null;

  // Handle direct URL (mock/external)
  if (image.src || image.url) {
    const src = image.src || image.url || '';
    const w_orig = image.width || 800;
    const h_orig = image.height || 600;

    const w_calc = w ? Number(w) : !!h && Math.floor((Number(h) * w_orig) / h_orig);
    const h_calc = h ? Number(h) : !!w && Math.floor((Number(w) * h_orig) / w_orig);

    return (
      <Image
        src={src}
        width={w_calc || w_orig}
        height={h_calc || h_orig}
        alt={props.alt || image.alt || ''}
        {...props}
      />
    );
  }

  const generatedSrc = generateSrc(image, w, h);
  if (!generatedSrc) return null;

  const { src, width, height } = generatedSrc;
  const isGif = src.includes('.gif');
  const isSvg = src.toLowerCase().endsWith('.svg');

  // Get loading value and ensure it's valid
  const loadingValue = stegaClean(image.loading);
  const validLoading = props.priority
    ? undefined
    : loadingProp || (loadingValue === 'eager' || loadingValue === 'lazy' ? loadingValue : 'lazy');

  if (validLoading === 'eager') {
    preload(src, { as: 'image' });
  }

  return (
    <Image
      src={isGif ? src.split('?')[0] : src}
      width={width}
      height={height}
      alt={props.alt || image.alt || image.altText || image.asset?.altText || ''}
      unoptimized={isGif || isSvg}
      {...props}
      loading={validLoading}
    />
  );
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

  // Get loading value and ensure it's valid
  const loadingValue = stegaClean(image.loading);
  const validLoading = loadingValue === 'eager' || loadingValue === 'lazy' ? loadingValue : 'lazy';

  if (validLoading === 'eager') {
    preload(src, { as: 'image' });
  }

  return <source srcSet={src} width={width} height={height} media={media} {...(props as any)} />;
}

function generateSrc(
  image: Sanity.Image,
  w?: number | `${number}` | string,
  h?: number | `${number}` | string
) {
  try {
    const { width: w_orig, height: h_orig } = getImageDimensions(image as any);

    const w_calc = w ? Number(w) : !!h && Math.floor((Number(h) * w_orig) / h_orig);
    const h_calc = h ? Number(h) : !!w && Math.floor((Number(w) * h_orig) / w_orig);

    return {
      src: urlFor(image as any)
        .withOptions({
          width: w ? Number(w) : undefined,
          height: h ? Number(h) : undefined,
          auto: 'format',
        })
        .url(),
      width: (w_calc || w_orig) as number,
      height: (h_calc || h_orig) as number,
    };
  } catch (error) {
    console.error('Error generating src', error, image);
    return null;
  }
}
