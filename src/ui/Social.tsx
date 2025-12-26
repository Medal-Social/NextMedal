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

  type SocialLink = { _key: string; text: string; url: string };

  return (
    <nav className={cn('flex flex-wrap items-center gap-1', className)}>
      {socialLinks.map((item: SocialLink, idx: number) => (
        <Button
          key={item.url || idx}
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-full motion-safe:transition-all motion-safe:duration-200 motion-safe:hover:scale-110 hover:bg-primary/10"
          nativeButton={false}
          render={
            <a href={item.url} target="_blank" rel="noopener noreferrer" aria-label={item.text}>
              <Icon url={item.url} aria-hidden="true" className="h-4 w-4" />
            </a>
          }
        />
      ))}
    </nav>
  );
}

function Icon({ url, ...props }: { url?: string } & React.ComponentProps<'svg'>) {
  if (!url) return null;

  let hostname = '';
  try {
    const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
    hostname = urlObj.hostname.toLowerCase();
  } catch (_e) {
    return <IoIosLink {...props} />;
  }

  const matches = (domain: string) => hostname === domain || hostname.endsWith(`.${domain}`);

  return matches('bsky.app') ? (
    <FaBluesky {...props} />
  ) : matches('facebook.com') ? (
    <FaFacebookF {...props} />
  ) : matches('github.com') ? (
    <FaGithub {...props} />
  ) : matches('instagram.com') ? (
    <FaInstagram {...props} />
  ) : matches('linkedin.com') ? (
    <FaLinkedinIn {...props} />
  ) : matches('tiktok.com') ? (
    <FaTiktok {...props} />
  ) : matches('twitter.com') || matches('x.com') ? (
    <FaXTwitter {...props} />
  ) : matches('youtube.com') || matches('youtu.be') ? (
    <FaYoutube {...props} />
  ) : (
    <IoIosLink {...props} />
  );
}
