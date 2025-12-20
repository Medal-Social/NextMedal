'use client';

import { Check, Copy } from 'lucide-react';
import { useState } from 'react';
import { FaLinkedin, FaXTwitter } from 'react-icons/fa6';
import { toast } from 'sonner';

export default function SocialShare({ title, slug }: { title: string; slug: string }) {
  const [copied, setCopied] = useState(false);
  const url = typeof window !== 'undefined' ? `${window.location.origin}/blog/${slug}` : '';

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
    },
    {
      name: 'LinkedIn',
      icon: FaLinkedin,
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    },
  ];

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium text-muted-foreground mr-2">Share:</span>
      {shareLinks.map((link) => (
        <a
          key={link.name}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
          aria-label={`Share on ${link.name}`}
        >
          <link.icon className="w-4 h-4" />
        </a>
      ))}
      <button
        type="button"
        onClick={handleCopy}
        className="p-2 rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
        aria-label="Copy link"
      >
        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
      </button>
    </div>
  );
}
