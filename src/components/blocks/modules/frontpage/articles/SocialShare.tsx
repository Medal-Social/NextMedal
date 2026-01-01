'use client';

import { Check, Link } from 'lucide-react';
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
  slug,
  className,
}: {
  title: string;
  slug: string;
  className?: string;
}) {
  const t = useTranslations('article');
  const [copied, setCopied] = useState(false);
  // Default to empty string on server to match initial client state
  const [url, setUrl] = useState('');

  useEffect(() => {
    // Only set URL on client side
    setUrl(`${window.location.origin}/articles/${slug}`);
  }, [slug]);

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
