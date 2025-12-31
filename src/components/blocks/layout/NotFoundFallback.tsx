'use client';

import { FileQuestion } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { buttonVariants } from '@/components/ui/button';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import { Section } from '@/components/ui/section';

export default function NotFoundFallback() {
  const t = useTranslations('NotFound');

  return (
    <Section className="min-h-[50vh] flex items-center justify-center">
      <Empty className="border-none max-w-md mx-auto">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <FileQuestion />
          </EmptyMedia>
          <EmptyTitle>{t('title')}</EmptyTitle>
          <EmptyDescription>{t('description')}</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Link href="/" className={buttonVariants()}>
            {t('goHome')}
          </Link>
        </EmptyContent>
      </Empty>
    </Section>
  );
}
