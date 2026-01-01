'use client';

import { Clock } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function ReadTime({
  value,
  ...props
}: { value: number } & React.ComponentProps<'span'>) {
  const t = useTranslations('article');
  const minutes = Math.ceil(value);
  return (
    <span className="flex items-center gap-x-1" {...props}>
      <Clock className="size-4" /> <span className="font-numeric">{minutes}</span>{' '}
      {minutes === 1 ? t('minute') : t('minutes')}
    </span>
  );
}
