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
    <picture {...pictureProps}>
      {img.responsive?.map((r) => (
        <Source {...r} key={r.image.url || r.media} />
      ))}
      <Img image={img.image} {...props} />
    </picture>
  );
}

export function Img({
  image,
  width: w,
  height: h,
  loading: _loading,
  ...props
}: {
  image?:
    | Sanity.Image
    | { src?: string; url?: string; alt?: string; width?: number; height?: number };
} & ImgProps) {
  if (!image) return null;

  // Handle direct URL (mock/external)
  if (('src' in image && image.src) || ('url' in image && image.url)) {
    const src = (image as any).src || (image as any).url;
    return (
      <Image
        src={src}
        width={Number(w) || (image as any).width || 800}
        height={Number(h) || (image as any).height || 600}
        alt={props.alt || image.alt || ''}
        {...props}
      />
    );
  }

  const sanityImage = image as Sanity.Image;
  const generatedSrc = generateSrc(sanityImage, w, h);
  const isGif = generatedSrc?.src?.includes('.gif');
  const isSvg = generatedSrc?.src?.toLowerCase().endsWith('.svg');
  if (!generatedSrc) return null;

  const { src, width, height } = generatedSrc;

  // Get loading value and ensure it's valid
  const loadingValue = stegaClean(sanityImage.loading);
  const validLoading = props.priority
    ? undefined
    : _loading || (loadingValue === 'eager' || loadingValue === 'lazy' ? loadingValue : 'lazy');

  if (validLoading === 'eager') {
    preload(src, { as: 'image' });
  }

  return (
    <Image
      src={isGif ? src.split('?')[0] : src}
      width={width}
      height={height}
      alt={props.alt || sanityImage.alt || sanityImage.altText || sanityImage.asset?.altText || ''}
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

  return <source srcSet={src} width={width} height={height} media={media} {...props} />;
}

function generateSrc(
  image: Sanity.Image,
  w?: number | `${number}` | string,
  h?: number | `${number}` | string
) {
  try {
    const { width: w_orig, height: h_orig } = getImageDimensions(image);

    const w_calc = w // if width is provided
      ? Number(w)
      : // if height is provided, calculate width
        !!h && Math.floor((Number(h) * w_orig) / h_orig);

    const h_calc = h // if height is provided
      ? Number(h)
      : // if width is provided, calculate height
        !!w && Math.floor((Number(w) * h_orig) / w_orig);

    return {
      src: urlFor(image)
        .withOptions({
          width: w ? Number(w) : undefined,
          height: h ? Number(h) : undefined,
          auto: 'format',
        })
        .url(),
      width: w_calc || w_orig,
      height: h_calc || h_orig,
    };
  } catch (error) {
    console.error('Error generating src', error, image);
    return null;
  }
}
