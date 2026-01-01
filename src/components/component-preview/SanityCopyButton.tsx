'use client';

import { Check, Copy } from 'lucide-react';
import * as React from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { logger } from '@/lib/core/logger';
import { copyToClipboard } from '@/lib/utils/clipboard';
import { base64, cn } from '@/lib/utils/index';

interface SanityCopyButtonProps {
  data: Record<string, unknown> | null;
  className?: string;
}

/**
 * Regenerates keys and handles Sanity-specific data transformations
 */
function prepareSanityData(data: unknown): unknown {
  if (!data || typeof data !== 'object') return data;

  // Handle arrays
  if (Array.isArray(data)) {
    return data.map((item) => prepareSanityData(item));
  }

  const obj = data as Record<string, unknown>;
  const result: Record<string, unknown> = {
    // Every object needs a fresh key for Sanity's array validation
    _key: Math.random().toString(36).substring(2, 11),
  };

  // Handle references (Logo, Person, Pricing, etc. often come as full objects from GROQ)
  if (obj._id && !(obj._type as string)?.startsWith('image')) {
    return {
      _type: 'reference',
      _ref: obj._id,
      _key: result._key,
    };
  }

  for (const [key, value] of Object.entries(obj)) {
    // Skip internal frontend fields and existing keys (we want fresh ones)
    if (['src', 'width', 'height', 'alt', 'sanityData', '_key', '_rev', '_id'].includes(key))
      continue;

    // Recursive processing
    result[key] = prepareSanityData(value);
  }

  // Preserve _type if it exists, otherwise default to 'object'
  if (obj._type) {
    result._type = obj._type;
  } else {
    result._type = 'object';
  }

  return result;
}

export default function SanityCopyButton({ data, className }: SanityCopyButtonProps) {
  const [hasCopied, setHasCopied] = React.useState(false);

  React.useEffect(() => {
    if (hasCopied) {
      const timeout = setTimeout(() => {
        setHasCopied(false);
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [hasCopied]);

  const handleCopy = async () => {
    if (!data) return;

    try {
      await copyToSanityClipboard(data);
      setHasCopied(true);
      toast.success('Copied to Sanity Clipboard', {
        description: 'You can now "Paste" directly into a Sanity Studio array field.',
      });
    } catch (err) {
      logger.error({ err }, 'Failed to copy to Sanity clipboard');
      await handleFallbackCopy(data);
    }
  };

  const copyToSanityClipboard = async (data: Record<string, unknown>) => {
    const cleanData = prepareSanityData(data);
    const payload = {
      type: 'sanityClipboardItem',
      value: Array.isArray(cleanData) ? cleanData : [cleanData],
      patchType: 'append',
      documentId: 'copy-paste-context',
      documentType: 'page',
      isDocument: false,
      schemaTypeName: data._type || (Array.isArray(cleanData) ? cleanData[0]?._type : 'object'),
      valuePath: ['modules'],
    };

    const jsonString = JSON.stringify(payload);
    const encodedBase64 = base64(jsonString);
    const htmlSnippet = `<div data-sanity-clipboard-base64="${encodedBase64}">Sanity Studio Data</div>`;

    const clipboardItem = new ClipboardItem({
      'text/plain': new Blob([jsonString], { type: 'text/plain' }),
      'text/html': new Blob([htmlSnippet], { type: 'text/html' }),
    });

    await navigator.clipboard.write([clipboardItem]);
  };

  const handleFallbackCopy = async (data: Record<string, unknown>) => {
    const success = await copyToClipboard(JSON.stringify(data, null, 2));

    if (success) {
      setHasCopied(true);
      toast.error('Partial Copy', {
        description: 'Used fallback copy method. Studio "Paste" might not work as expected.',
      });
    } else {
      logger.error('Fallback clipboard write failed');
      toast.error('Copy Failed', {
        description: 'Clipboard is not available in this context.',
      });
    }
  };

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            size="icon"
            variant="ghost"
            className={cn(
              'relative z-10 h-6 w-6 text-zinc-50 hover:bg-zinc-700 hover:text-zinc-50',
              className
            )}
          />
        }
        onClick={handleCopy}
      >
        <span className="sr-only">Copy</span>
        {hasCopied ? <Check className="h-3 w-3 text-green-400" /> : <Copy className="h-3 w-3" />}
      </TooltipTrigger>
      <TooltipContent className="bg-zinc-900 text-zinc-50">Copy for Sanity Studio</TooltipContent>
    </Tooltip>
  );
}
