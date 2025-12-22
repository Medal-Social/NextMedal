import { groq } from 'next-sanity';
import { fetchSanityLive } from '@/sanity/lib/live';
import { LINK_QUERY } from '@/sanity/lib/queries';
import BannerClient from './Banner-client';

export default async function Banner() {
  const banners = await fetchSanityLive<(Sanity.Banner & Sanity.Module)[]>({
    query: groq`*[_type == 'site'][0].banners[]->{
			...,
			cta{ ${LINK_QUERY} },
		}`,
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
