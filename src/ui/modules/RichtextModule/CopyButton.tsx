'use client';

import { Check, Copy } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { logger } from '@/lib/logger';
import { cn } from '@/lib/utils';

export default function CopyButton({ code, className }: { code: string; className?: string }) {
  const [copied, setCopied] = useState(false);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      toast.success('Copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      logger.error({ err }, 'Failed to copy code:');
      toast.error('Failed to copy code');
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      className={cn('text-white hover:bg-white/10 hover:text-white transition-all', className)}
      onClick={onCopy}
      aria-label={copied ? 'Copied' : 'Copy code'}
    >
      {copied ? <Check className="size-4 text-brand-300" /> : <Copy className="size-4" />}
    </Button>
  );
}
