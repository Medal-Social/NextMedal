'use client';

import { Copy, Home, LayoutGrid } from 'lucide-react';
import Link from 'next/link';
import type * as React from 'react';
import { toast } from 'sonner';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { urlFor } from '@/sanity/lib/image';

interface BrandMenuProps {
  children: React.ReactNode;
  logoData?: any;
  hasBrandPage?: boolean;
}

export default function BrandMenu({ children, logoData, hasBrandPage }: BrandMenuProps) {
  const image = logoData?.image?.default;
  const extension = image?.asset?.extension || 'svg';
  const label = extension === 'png' ? 'Copy Logo PNG' : 'Copy Logo SVG';

  const handleCopyLogo = async (_e: React.MouseEvent) => {
    // Context Menu items don't need preventDefault usually, but logic remains same
    try {
      // Logic to get logo URL
      if (!image) {
        throw new Error('No logo image found');
      }

      const url = urlFor(image).url();

      if (url) {
        await navigator.clipboard.writeText(url);
        toast.success('Logo URL copied to clipboard');
      } else {
        throw new Error('Could not generate logo URL');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to copy logo');
    }
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger
        render={<div className="cursor-pointer flex items-center">{children}</div>}
      />
      <ContextMenuContent className="w-56 p-2 z-[200]">
        <ContextMenuItem
          render={
            <Link href="/" className="flex items-center cursor-pointer gap-2">
              <Home className="w-4 h-4" />
              <span>Go to Home</span>
            </Link>
          }
        />
        <ContextMenuItem onClick={handleCopyLogo} className="cursor-pointer gap-2">
          <Copy className="w-4 h-4" />
          <span>{label}</span>
        </ContextMenuItem>

        {hasBrandPage && <ContextMenuSeparator />}

        {hasBrandPage && (
          <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground bg-muted/50 rounded-sm mb-1">
            Medal Social
          </div>
        )}

        {hasBrandPage && (
          <ContextMenuItem
            render={
              <Link href="/brand" className="flex items-center cursor-pointer gap-2 font-medium">
                <LayoutGrid className="w-4 h-4 text-primary" />
                <span>Brand Center</span>
              </Link>
            }
          />
        )}
      </ContextMenuContent>
    </ContextMenu>
  );
}
