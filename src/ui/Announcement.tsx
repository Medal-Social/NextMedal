import { fetchSanityLive } from '@/sanity/lib/fetch';
import { LINK_QUERY } from '@/sanity/lib/queries';
import { groq } from 'next-sanity';
import AnnouncementClient from './Announcement-client';

export default async function Announcement() {
  const announcements = await fetchSanityLive<(Sanity.Announcement & Sanity.Module)[]>({
    query: groq`*[_type == 'site'][0].announcements[]->{
			...,
			cta{ ${LINK_QUERY} },
		}`,
  });
  if (!announcements) return null;

  return (
    <>
      {announcements?.map((announcement) => (
        <AnnouncementClient key={announcement._id} announcement={announcement} />
      ))}
    </>
  );
}
