import { ResponsiveImg } from '../Img';

export const ImageBackground = ({ asset }: { asset?: Sanity.Img }) => {
  if (!asset) return null;

  return (
    <div className="absolute inset-0 z-0">
      <ResponsiveImg
        img={asset}
        className="size-full object-cover"
        width={2400}
        draggable={false}
      />
      <div className="absolute inset-0 bg-black/60" />
    </div>
  );
};
