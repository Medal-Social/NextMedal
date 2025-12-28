import { fetchSanityLive } from '@/sanity/lib/live';
import { SITE_BANNERS_QUERY } from '@/sanity/lib/queries';
import BannerClient from './Banner.client';

export default async function Banner() {
  const banners = await fetchSanityLive<(Sanity.Banner & Sanity.Module)[]>({
    query: SITE_BANNERS_QUERY,
  });
  if (!banners) return null;

  return (
    <>
      {banners?.map((banner) => (
        <BannerClient key={banner._id} banner={banner} />
      ))}
    </>
  );
}
