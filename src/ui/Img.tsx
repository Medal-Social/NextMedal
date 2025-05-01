import { urlFor } from '@/sanity/lib/image';
import { getImageDimensions } from '@sanity/asset-utils';
import { stegaClean } from 'next-sanity';
import Image, { type ImageProps } from 'next/image';
import type { ComponentProps } from 'react';
import { preload } from 'react-dom';

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

export function Img({ image, width: w, height: h, ...props }: { image?: Sanity.Image } & ImgProps) {
  if (!image) return null;

  const generatedSrc = generateSrc(image, w, h);
  const isGif = generatedSrc?.src?.includes('.gif');
  if (!generatedSrc) return null;

  const { src, width, height } = generatedSrc;

  // Get loading value and ensure it's valid
  const loadingValue = stegaClean(image.loading);
  const validLoading = loadingValue === 'eager' || loadingValue === 'lazy' ? loadingValue : 'lazy';

  if (validLoading === 'eager') {
    preload(src, { as: 'image' });
  }

  return (
    <Image
      src={isGif ? src.split('?')[0] : src}
      width={width}
      height={height}
      alt={props.alt || image.alt || image.altText || image.asset?.altText || ''}
      loading={validLoading}
      unoptimized={isGif}
      {...props}
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
