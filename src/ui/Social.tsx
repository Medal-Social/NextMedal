import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import CTA from './CTA';

import { getSite } from '@/sanity/lib/fetch';
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

export default async function Social({ className }: React.ComponentProps<'div'>) {
  const { social } = await getSite();

  if (!social?.items?.length) return null;

  return (
    <nav className={cn('flex flex-wrap items-center gap-1', className)}>
      {social.items.map((item) => {
        switch (item._type) {
          case 'link':
            return item.external ? (
              <Button
                key={`${item._type}-${item.external}`}
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-full"
                asChild
              >
                <a
                  href={item.external}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={item.label}
                >
                  <Icon url={item.external} aria-hidden="true" className="h-4 w-4" />
                </a>
              </Button>
            ) : (
              <CTA className="px-2 py-1" link={item} key={`${item._type}-${item.label}`}>
                <Icon url={item.external} aria-label={item.label} />
              </CTA>
            );

          default:
            return null;
        }
      })}
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
