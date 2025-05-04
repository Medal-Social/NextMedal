import { ResponsiveImg } from '@/ui/Img';

/**
 * Component for rendering an asymmetric layout of multiple images
 * Works with up to 4 images and creates a visually appealing layout
 */
export const AsymmetricImageLayout = ({ assets }: { assets: Sanity.Img[] }) => {
  if (!assets || assets.length === 0) return null;

  // Handle different cases depending on how many images we have
  const imageCount = assets.length;

  return (
    <div className="flex flex-wrap items-start justify-end gap-6 sm:gap-8 lg:contents">
      {imageCount >= 1 && (
        <div className="w-0 flex-auto lg:ml-auto lg:w-auto lg:flex-none lg:self-end">
          <ResponsiveImg
            img={assets[0]}
            className="aspect-[7/5] w-[37rem] max-w-none rounded-2xl bg-gray-50 object-cover"
            width={1152}
            height={800}
            sizes="(max-width: 1024px) 100vw, 37rem"
            quality={90}
            draggable={false}
          />
        </div>
      )}
      <div className="contents lg:col-span-2 lg:col-end-2 lg:ml-auto lg:flex lg:w-[37rem] lg:items-start lg:justify-end lg:gap-x-8">
        {imageCount >= 2 && (
          <div className="order-first flex w-64 flex-none justify-end self-end lg:w-auto">
            <ResponsiveImg
              img={assets[1]}
              className="aspect-[4/3] w-[24rem] max-w-none flex-none rounded-2xl bg-gray-50 object-cover"
              width={768}
              height={604}
              sizes="(max-width: 1024px) 50vw, 24rem"
              quality={90}
              draggable={false}
            />
          </div>
        )}
        {imageCount >= 3 && (
          <div className="flex w-96 flex-auto justify-end lg:w-auto lg:flex-none">
            <ResponsiveImg
              img={assets[2]}
              className="aspect-[7/5] w-[37rem] max-w-none flex-none rounded-2xl bg-gray-50 object-cover"
              width={1152}
              height={842}
              sizes="(max-width: 1024px) 100vw, 37rem"
              quality={90}
              draggable={false}
            />
          </div>
        )}
        {imageCount >= 4 && (
          <div className="hidden sm:block sm:w-0 sm:flex-auto lg:w-auto lg:flex-none">
            <ResponsiveImg
              img={assets[3]}
              className="aspect-[4/3] w-[24rem] max-w-none rounded-2xl bg-gray-50 object-cover"
              width={768}
              height={604}
              sizes="(max-width: 1024px) 50vw, 24rem"
              quality={90}
              draggable={false}
            />
          </div>
        )}
      </div>
    </div>
  );
};
