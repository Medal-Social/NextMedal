'use client';

import { Check, Link } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { IconLinkedin, IconTwitterX, IconWhatsapp } from '@/components/icons/social-icons';
import { Button, buttonVariants } from '@/components/ui/button';
import { ButtonGroup } from '@/components/ui/button-group';
import { copyToClipboard } from '@/lib/utils/clipboard';
import { cn } from '@/lib/utils/index';

export default function SocialShare({
  title,
  className,
}: {
  title: string;
  /** Retained for caller compatibility; the share URL now comes from the live pathname. */
  slug?: string;
  className?: string;
}) {
  const t = useTranslations('article');
  const pathname = usePathname();
  const [copied, setCopied] = useState(false);
  // Default to empty string on server to match initial client state
  const [url, setUrl] = useState('');

  useEffect(() => {
    // Share the current article URL. The pathname is already locale-prefixed and
    // at the correct `/[collection]/[slug]` route, so use it directly rather than
    // hardcoding an `/articles/` segment that doesn't match the route. Reading the
    // reactive pathname (not window.location) also refreshes the URL when
    // navigating client-side between detail pages, where this component is
    // reconciled in place rather than remounted.
    setUrl(`${window.location.origin}${pathname}`);
  }, [pathname]);

  const handleCopy = async () => {
    const success = await copyToClipboard(url);

    if (success) {
      setCopied(true);
      toast.success(t('linkCopied'));
      setTimeout(() => setCopied(false), 2000);
    } else {
      toast.error(t('linkCopyFailed'));
    }
  };

  const shareLinks = [
    {
      name: 'Twitter',
      icon: IconTwitterX,
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
      hoverColor: 'hover:text-foreground',
    },
    {
      name: 'LinkedIn',
      icon: IconLinkedin,
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      hoverColor: 'hover:text-[#0A66C2]',
    },
    {
      name: 'WhatsApp',
      icon: IconWhatsapp,
      url: `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`,
      hoverColor: 'hover:text-[#25D366]',
    },
  ];

  return (
    <ButtonGroup className={cn('w-full', className)}>
      {shareLinks.map((link) => (
        <a
          key={link.name}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            buttonVariants({ variant: 'outline', size: 'lg' }),
            'flex-1 text-muted-foreground',
            link.hoverColor
          )}
          aria-label={t('shareOn', { platform: link.name })}
        >
          <link.icon className="size-5" />
        </a>
      ))}
      <Button
        variant="outline"
        size="lg"
        onClick={handleCopy}
        className="flex-1 text-muted-foreground hover:text-foreground"
        aria-label={t('copyLink')}
      >
        {copied ? <Check className="size-5" /> : <Link className="size-5" />}
      </Button>
    </ButtonGroup>
  );
}
