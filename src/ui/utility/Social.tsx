import type { IconType } from 'react-icons';
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

// Domain to icon mapping - each entry can have multiple domains
const SOCIAL_ICONS: Array<{ domains: string[]; icon: IconType }> = [
  { domains: ['bsky.app'], icon: FaBluesky },
  { domains: ['facebook.com'], icon: FaFacebookF },
  { domains: ['github.com'], icon: FaGithub },
  { domains: ['instagram.com'], icon: FaInstagram },
  { domains: ['linkedin.com'], icon: FaLinkedinIn },
  { domains: ['tiktok.com'], icon: FaTiktok },
  { domains: ['twitter.com', 'x.com'], icon: FaXTwitter },
  { domains: ['youtube.com', 'youtu.be'], icon: FaYoutube },
];

function getIconForUrl(url: string): IconType {
  let hostname = '';
  try {
    const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
    hostname = urlObj.hostname.toLowerCase();
  } catch {
    return IoIosLink;
  }

  const matches = (domain: string) => hostname === domain || hostname.endsWith(`.${domain}`);

  const matchedIcon = SOCIAL_ICONS.find((entry) => entry.domains.some(matches));
  return matchedIcon?.icon ?? IoIosLink;
}

export default async function Social({ className }: React.ComponentProps<'div'>) {
  const { socialLinks } = await getSite();

  if (!socialLinks?.length) return null;

  type SocialLink = { _key: string; text: string; url: string };

  return (
    <nav className={cn('flex flex-wrap items-center gap-1', className)}>
      {socialLinks.map((item: SocialLink, idx: number) => {
        const IconComponent = getIconForUrl(item.url);
        return (
          <Button
            key={item.url || idx}
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-full motion-safe:transition-all motion-safe:duration-200 motion-safe:hover:scale-110 hover:bg-primary/10"
            nativeButton={false}
            render={
              <a href={item.url} target="_blank" rel="noopener noreferrer" aria-label={item.text}>
                <IconComponent aria-hidden="true" className="h-4 w-4" />
              </a>
            }
          />
        );
      })}
    </nav>
  );
}
