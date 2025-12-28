import type { ComponentType, SVGProps } from 'react';
import {
  IconBluesky,
  IconFacebookF,
  IconGithub,
  IconInstagram,
  IconLink,
  IconLinkedinIn,
  IconTiktok,
  IconTwitterX,
  IconYoutube,
} from '@/components/icons/social-icons';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { getSite } from '@/sanity/lib/fetch';

type IconComponent = ComponentType<SVGProps<SVGSVGElement>>;

// Domain to icon mapping - each entry can have multiple domains
const SOCIAL_ICONS: Array<{ domains: string[]; icon: IconComponent }> = [
  { domains: ['bsky.app'], icon: IconBluesky },
  { domains: ['facebook.com'], icon: IconFacebookF },
  { domains: ['github.com'], icon: IconGithub },
  { domains: ['instagram.com'], icon: IconInstagram },
  { domains: ['linkedin.com'], icon: IconLinkedinIn },
  { domains: ['tiktok.com'], icon: IconTiktok },
  { domains: ['twitter.com', 'x.com'], icon: IconTwitterX },
  { domains: ['youtube.com', 'youtu.be'], icon: IconYoutube },
];

function getIconForUrl(url: string): IconComponent {
  let hostname = '';
  try {
    const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
    hostname = urlObj.hostname.toLowerCase();
  } catch {
    return IconLink;
  }

  const matches = (domain: string) => hostname === domain || hostname.endsWith(`.${domain}`);

  const matchedIcon = SOCIAL_ICONS.find((entry) => entry.domains.some(matches));
  return matchedIcon?.icon ?? IconLink;
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
