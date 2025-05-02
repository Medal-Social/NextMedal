import { ResponsiveImg } from '@/ui/Img';

/**
 * Component for rendering a regular grid layout of multiple images
 * Uses a 2x2 grid for 4 images, or adapts to fewer images
 */
export const RegularImageLayout = ({ assets }: { assets: Sanity.Img[] }) => {
  if (!assets || assets.length === 0) return null;

  // Handle different cases depending on how many images we have
  const imageCount = assets.length;

  return (
    <div className="mt-16 sm:mt-20 lg:mt-24">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {imageCount >= 1 && (
          <ResponsiveImg
            img={assets[0]}
            className="aspect-[4/3] w-full rounded-2xl bg-gray-50 object-cover"
            width={800}
            height={600}
            sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 25vw"
            quality={90}
            draggable={false}
          />
        )}
        {imageCount >= 2 && (
          <ResponsiveImg
            img={assets[1]}
            className="aspect-[4/3] w-full rounded-2xl bg-gray-50 object-cover"
            width={800}
            height={600}
            sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 25vw"
            quality={90}
            draggable={false}
          />
        )}
        {imageCount >= 3 && (
          <ResponsiveImg
            img={assets[2]}
            className="aspect-[4/3] w-full rounded-2xl bg-gray-50 object-cover"
            width={800}
            height={600}
            sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 25vw"
            quality={90}
            draggable={false}
          />
        )}
        {imageCount >= 4 && (
          <ResponsiveImg
            img={assets[3]}
            className="aspect-[4/3] w-full rounded-2xl bg-gray-50 object-cover"
            width={800}
            height={600}
            sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 25vw"
            quality={90}
            draggable={false}
          />
        )}
      </div>
    </div>
  );
};
