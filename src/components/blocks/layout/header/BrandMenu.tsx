'use client';

import { Copy, Home, LayoutGrid } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import type * as React from 'react';
import { toast } from 'sonner';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { DEFAULT_LOCALE } from '@/i18n/config';
import { logger } from '@/lib/core/logger';
import { copyToClipboard } from '@/lib/utils/clipboard';
import { urlFor } from '@/sanity/lib/image';

interface BrandMenuProps {
  children: React.ReactNode;
  logoData?: Sanity.Logo;
  hasBrandPage?: boolean;
}

export default function BrandMenu({ children, logoData, hasBrandPage }: BrandMenuProps) {
  const t = useTranslations('brand');
  const locale = useLocale();
  const pathname = usePathname();
  const image = logoData?.image?.default;
  const extension = (image?.asset as { extension?: string } | undefined)?.extension || 'svg';
  const label = extension === 'png' ? t('copyLogoPng') : t('copyLogoSvg');

  // Generate locale-aware links
  const homeHref = locale === DEFAULT_LOCALE ? '/' : `/${locale}`;
  const brandHref = locale === DEFAULT_LOCALE ? '/brand' : `/${locale}/brand`;

  // Scroll to top when clicking "Go to Home" while already on homepage
  const handleHomeClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (pathname === homeHref) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleCopyLogo = async () => {
    try {
      // Logic to get logo URL
      if (!image) {
        throw new Error('No logo image found');
      }

      const url = urlFor(image).url();

      if (url) {
        const success = await copyToClipboard(url);

        if (success) {
          toast.success(t('logoCopied'));
        } else {
          logger.error('Failed to copy logo URL');
          toast.error(t('copyFailed'));
        }
      } else {
        throw new Error('Could not generate logo URL');
      }
    } catch (err) {
      logger.error(err);
      toast.error(t('copyFailed'));
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
            <Link
              href={homeHref}
              onClick={handleHomeClick}
              className="flex items-center cursor-pointer gap-2"
            >
              <Home className="w-4 h-4" />
              <span>{t('goToHome')}</span>
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
              <Link href={brandHref} className="flex items-center cursor-pointer gap-2 font-medium">
                <LayoutGrid className="w-4 h-4 text-primary" />
                <span>{t('brandCenter')}</span>
              </Link>
            }
          />
        )}
      </ContextMenuContent>
    </ContextMenu>
  );
}
