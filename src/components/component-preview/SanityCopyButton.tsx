'use client';

import { Check, Copy } from 'lucide-react';
import * as React from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { logger } from '@/lib/logger';
import { base64, cn } from '@/lib/utils';

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
    logger.info('[SanityCopyButton] handleCopy called');
    logger.info({ data }, '[SanityCopyButton] data:');

    if (!data) {
      logger.info('[SanityCopyButton] No data provided, returning early');
      return;
    }

    try {
      // 1. Prepare and clean the data
      const cleanData = prepareSanityData(data);
      logger.info({ cleanData }, '[SanityCopyButton] cleanData:');

      // 2. Wrap in Sanity clipboard payload
      const payload = {
        type: 'sanityClipboardItem',
        value: Array.isArray(cleanData) ? cleanData : [cleanData],
        patchType: 'append',
        // Sanity context fields
        documentId: 'copy-paste-context',
        documentType: 'page',
        isDocument: false,
        // Safely infer schema type from either the object itself or the first item if it's an array
        schemaTypeName: data._type || (Array.isArray(cleanData) ? cleanData[0]?._type : 'object'),
        valuePath: ['modules'],
      };
      logger.info({ payload }, '[SanityCopyButton] payload:');

      // 3. Encode to Base64
      const jsonString = JSON.stringify(payload);
      logger.info({ jsonStringLength: jsonString.length }, '[SanityCopyButton] jsonString length:');
      const encodedBase64 = base64(jsonString);
      logger.info(
        { encodedBase64Length: encodedBase64.length },
        '[SanityCopyButton] encodedBase64 length:'
      );

      // 4. Create the HTML snippet Sanity expects
      const htmlSnippet = `<div data-sanity-clipboard-base64="${encodedBase64}">Sanity Studio Data</div>`;

      // 5. Use ClipboardItem API to write both text and HTML
      logger.info('[SanityCopyButton] Creating ClipboardItem...');
      const clipboardItem = new ClipboardItem({
        'text/plain': new Blob([jsonString], { type: 'text/plain' }),
        'text/html': new Blob([htmlSnippet], { type: 'text/html' }),
      });

      logger.info('[SanityCopyButton] Writing to clipboard...');
      await navigator.clipboard.write([clipboardItem]);
      logger.info('[SanityCopyButton] Clipboard write successful!');

      setHasCopied(true);
      toast.success('Copied to Sanity Clipboard', {
        description: 'You can now "Paste" directly into a Sanity Studio array field.',
      });
    } catch (err) {
      logger.error({ err }, 'Failed to copy to Sanity clipboard:');
      // Fallback to simple text copy if ClipboardItem fails (some browsers)
      try {
        logger.info('[SanityCopyButton] Trying fallback writeText...');
        await navigator.clipboard.writeText(JSON.stringify(data, null, 2));
        logger.info('[SanityCopyButton] Fallback writeText successful!');
        setHasCopied(true);
        toast.error('Partial Copy', {
          description: 'Used fallback copy method. Studio "Paste" might not work as expected.',
        });
      } catch (fallbackErr) {
        logger.error({ fallbackErr }, '[SanityCopyButton] Fallback writeText also failed:');
        toast.error('Copy Failed', {
          description: 'Could not write to clipboard.',
        });
      }
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <Button
            size="icon"
            variant="ghost"
            className={cn(
              'relative z-10 h-6 w-6 text-zinc-50 hover:bg-zinc-700 hover:text-zinc-50',
              className
            )}
            onClick={handleCopy}
          >
            <span className="sr-only">Copy</span>
            {hasCopied ? (
              <Check className="h-3 w-3 text-green-400" />
            ) : (
              <Copy className="h-3 w-3" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent className="bg-zinc-900 text-zinc-50">Copy for Sanity Studio</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
