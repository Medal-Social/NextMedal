import {
  FaBluesky,
  FaFacebookF,
  FaGithub,
  FaInstagram,
  FaLinkedinIn,
  FaTiktok,
  FaXTwitter,
  FaYoutube,
} from 'react-icons/fa6';
import { IoIosLink } from 'react-icons/io';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { getSite } from '@/sanity/lib/fetch';

export default async function Social({ className }: React.ComponentProps<'div'>) {
  const { socialLinks } = await getSite();

  if (!socialLinks?.length) return null;

  type SocialLink = { _key: string; platform: string; url: string };

  return (
    <nav className={cn('flex flex-wrap items-center gap-1', className)}>
      {socialLinks.map((item: SocialLink, idx: number) => (
        <Button
          key={item.url || idx}
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-full"
          asChild
        >
          <a href={item.url} target="_blank" rel="noopener noreferrer" aria-label={item.platform}>
            <Icon url={item.url} aria-hidden="true" className="h-4 w-4" />
          </a>
        </Button>
      ))}
    </nav>
  );
}

function Icon({ url, ...props }: { url?: string } & React.ComponentProps<'svg'>) {
  if (!url) return null;

  return url?.includes('bsky.app') ? (
    <FaBluesky {...props} />
  ) : url?.includes('facebook.com') ? (
    <FaFacebookF {...props} />
  ) : url?.includes('github.com') ? (
    <FaGithub {...props} />
  ) : url?.includes('instagram.com') ? (
    <FaInstagram {...props} />
  ) : url?.includes('linkedin.com') ? (
    <FaLinkedinIn {...props} />
  ) : url?.includes('tiktok.com') ? (
    <FaTiktok {...props} />
  ) : url?.includes('twitter.com') || url?.includes('x.com') ? (
    <FaXTwitter {...props} />
  ) : url?.includes('youtube.com') ? (
    <FaYoutube {...props} />
  ) : (
    <IoIosLink {...props} />
  );
}
