import { fetchSanityLive } from '@/sanity/lib/live';
import { SITE_BANNERS_QUERY } from '@/sanity/lib/queries';
import BannerClient from './Banner.client';

/**
 * Check if a banner is currently active based on start/end dates.
 * This runs on the server to avoid hydration mismatches.
 */
function isBannerActive(banner: Sanity.Banner & Sanity.Module): boolean {
  const now = new Date();
  const { start, end } = banner;

  // If no scheduling, always active
  if (!start && !end) return true;

  // Check start date
  if (start && new Date(start) > now) return false;

  // Check end date
  if (end && new Date(end) < now) return false;

  return true;
}

export default async function Banner() {
  const banners = await fetchSanityLive<(Sanity.Banner & Sanity.Module)[]>({
    query: SITE_BANNERS_QUERY,
  });

  if (!banners?.length) return null;

  // Filter to only active banners on the server
  const activeBanners = banners.filter(isBannerActive);

  if (!activeBanners.length) return null;

  // Only show the first active banner
  const banner = activeBanners[0];

  return <BannerClient banner={banner} />;
}
