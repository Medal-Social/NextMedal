'use client';

import { Check, Copy } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { logger } from '@/lib/core/logger';
import { copyToClipboard } from '@/lib/utils/clipboard';
import { cn } from '@/lib/utils/index';

export default function CopyButton({ code, className }: { code: string; className?: string }) {
  const [copied, setCopied] = useState(false);
  const t = useTranslations('code');

  const onCopy = async () => {
    const success = await copyToClipboard(code);

    if (success) {
      setCopied(true);
      toast.success(t('copied'));
      setTimeout(() => setCopied(false), 2000);
    } else {
      logger.error('Failed to copy code');
      toast.error(t('copyFailed'));
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
