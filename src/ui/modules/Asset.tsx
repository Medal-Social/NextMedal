import { ResponsiveImg } from '@/ui/Img';

export default function Asset({
  asset,
}: {
  asset?: Sanity.Img;
}) {
  if (!asset) return null;

  switch (asset?._type) {
    case 'img':
      return <ResponsiveImg img={asset} className="w-full" width={1200} />;

    default:
      return null;
  }
}
