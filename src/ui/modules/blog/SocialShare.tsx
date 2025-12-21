'use client';

import { Check, Link } from 'lucide-react';
import { useEffect, useState } from 'react';
import { FaLinkedin, FaWhatsapp, FaXTwitter } from 'react-icons/fa6';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function SocialShare({
  title,
  slug,
  className,
}: {
  title: string;
  slug: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);
  // Default to empty string on server to match initial client state
  const [url, setUrl] = useState('');

  useEffect(() => {
    // Only set URL on client side
    setUrl(`${window.location.origin}/blog/${slug}`);
  }, [slug]);

  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success('Link copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const shareLinks = [
    {
      name: 'Twitter',
      icon: FaXTwitter,
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
      hoverColor: 'hover:text-foreground',
    },
    {
      name: 'LinkedIn',
      icon: FaLinkedin,
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      hoverColor: 'hover:text-[#0A66C2]',
    },
    {
      name: 'WhatsApp',
      icon: FaWhatsapp,
      url: `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`,
      hoverColor: 'hover:text-[#25D366]',
    },
  ];

  return (
    <div className={cn('flex gap-3', className)}>
      {shareLinks.map((link) => (
        <a
          key={link.name}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            'flex-1 py-2 rounded-lg bg-secondary/50 hover:bg-secondary border border-border flex items-center justify-center text-muted-foreground transition-colors group',
            link.hoverColor
          )}
          aria-label={`Share on ${link.name}`}
        >
          <link.icon className="w-5 h-5" />
        </a>
      ))}
      <button
        type="button"
        onClick={handleCopy}
        className="flex-1 py-2 rounded-lg bg-secondary/50 hover:bg-secondary border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Copy link"
      >
        {copied ? <Check className="w-5 h-5" /> : <Link className="w-5 h-5" />}
      </button>
    </div>
  );
}
