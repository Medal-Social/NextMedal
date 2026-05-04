'use client';

import { Copy, Home, LayoutGrid } from 'lucide-react';
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
import { Link } from '@/i18n/navigation';
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
        render={<div className="flex cursor-pointer items-center">{children}</div>}
      />
      <ContextMenuContent className="z-[200] w-56 p-2">
        <ContextMenuItem
          render={
            <Link
              href={homeHref}
              onClick={handleHomeClick}
              className="flex cursor-pointer items-center gap-2"
            >
              <Home className="h-4 w-4" />
              <span>{t('goToHome')}</span>
            </Link>
          }
        />
        <ContextMenuItem onClick={handleCopyLogo} className="cursor-pointer gap-2">
          <Copy className="h-4 w-4" />
          <span>{label}</span>
        </ContextMenuItem>

        {hasBrandPage && <ContextMenuSeparator />}

        {hasBrandPage && (
          <div className="mb-1 rounded-sm bg-muted/50 px-2 py-1.5 font-semibold text-muted-foreground text-xs">
            Medal Social
          </div>
        )}

        {hasBrandPage && (
          <ContextMenuItem
            render={
              <Link href={brandHref} className="flex cursor-pointer items-center gap-2 font-medium">
                <LayoutGrid className="h-4 w-4 text-primary" />
                <span>{t('brandCenter')}</span>
              </Link>
            }
          />
        )}
      </ContextMenuContent>
    </ContextMenu>
  );
}
