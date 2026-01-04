'use client';

import { CheckCircle2 } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { stegaClean } from 'next-sanity';
import { useState } from 'react';
import { Form } from '@/components/blocks/forms';
import { Img } from '@/components/blocks/objects/core';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Section } from '@/components/ui/section';
import moduleProps from '@/lib/sanity/module-props';
import { cn } from '@/lib/utils/index';
import SharedPortableText from '../SharedPortableText';

interface BlockChildrenProps {
  children?: React.ReactNode;
}

const portableTextComponents = (style: 'sidebar' | 'featured') => ({
  list: {
    bullet: ({ children }: BlockChildrenProps) => (
      <ul className={cn('space-y-3 mb-8', style === 'sidebar' && 'mb-6')}>{children}</ul>
    ),
  },
  listItem: {
    bullet: ({ children }: BlockChildrenProps) => (
      <li className="flex items-start gap-3 group">
        <div className="mt-1 flex-shrink-0">
          <CheckCircle2
            className={cn(
              'h-5 w-5 text-primary transition-transform group-hover:scale-110',
              style === 'sidebar' && 'h-4 w-4 mt-1 text-white'
            )}
          />
        </div>
        <span
          className={cn(
            'text-muted-foreground leading-relaxed',
            style === 'sidebar' ? 'text-sm text-white/80' : 'text-base'
          )}
        >
          {children}
        </span>
      </li>
    ),
  },
  block: {
    h2: ({ children }: BlockChildrenProps) => (
      <h2
        className={cn(
          'font-extrabold tracking-tight mb-4',
          style === 'featured'
            ? 'text-3xl md:text-4xl text-foreground'
            : 'text-2xl md:text-3xl text-white'
        )}
      >
        {children}
      </h2>
    ),
    h3: ({ children }: BlockChildrenProps) => (
      <h3
        className={cn(
          'font-bold tracking-tight mb-4',
          style === 'featured'
            ? 'text-xl md:text-2xl text-foreground'
            : 'text-lg md:text-xl text-white'
        )}
      >
        {children}
      </h3>
    ),
    normal: ({ children }: BlockChildrenProps) => (
      <p
        className={cn(
          'mb-6 last:mb-0',
          style === 'featured' ? 'text-lg text-muted-foreground' : 'text-base text-white/90'
        )}
      >
        {children}
      </p>
    ),
  },
});

export default function LeadMagnet({
  content,
  buttonText,
  image,
  form,
  style: styleProp = 'featured',
  ...props
}: Sanity.LeadMagnet) {
  const locale = useLocale();
  const t = useTranslations('modules.leadMagnet');
  const style = stegaClean(styleProp);
  const [isModalOpen, setIsOpen] = useState(false);

  return (
    <Section {...moduleProps(props)}>
      <div
        className={cn(
          'relative overflow-hidden transition-all duration-300',
          style === 'sidebar'
            ? 'w-full p-6 bg-[#1a0b2e] border-none shadow-xl rounded-2xl'
            : 'bg-background p-8 md:p-12 rounded-[2rem]'
        )}
      >
        <div
          className={cn(
            'flex flex-col',
            style === 'featured'
              ? 'lg:flex-row lg:items-center gap-12'
              : 'items-start text-left gap-6'
          )}
        >
          {/* Image Side (Only for Featured) */}
          {style === 'featured' && image?.image && (
            <div className="relative shrink-0 lg:w-[40%]">
              <div className="relative z-10 overflow-hidden rounded-xl shadow-2xl transition-transform duration-500 hover:scale-[1.02]">
                <Img image={image.image} className="h-auto w-full object-cover" />
              </div>
              <div className="absolute -inset-4 z-0 bg-primary/10 blur-3xl rounded-full opacity-50" />
            </div>
          )}

          {/* Content Side */}
          <div className={cn('flex-1 text-left w-full')}>
            <SharedPortableText
              value={content}
              components={portableTextComponents(style)}
              className={cn('max-w-xl', style === 'sidebar' ? 'max-w-full' : 'mx-auto')}
            />

            <div className={cn('mt-6', style === 'sidebar' ? 'w-full' : 'flex justify-center')}>
              <Dialog open={isModalOpen} onOpenChange={setIsOpen}>
                <DialogTrigger
                  render={
                    <Button
                      size="lg"
                      className={cn(
                        'font-extrabold transition-all hover:scale-[1.02] active:scale-[0.98]',
                        style === 'featured'
                          ? 'h-14 px-8 text-lg shadow-lg shadow-primary/10'
                          : 'h-12 w-full text-base bg-white text-[#1a0b2e] hover:bg-white/95 border-none shadow-xl rounded-lg'
                      )}
                    >
                      {buttonText || t('defaultButtonText')}
                    </Button>
                  }
                />
                <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden border-none shadow-2xl">
                  <div className="bg-primary px-8 py-6 text-primary-foreground">
                    <DialogHeader>
                      <DialogTitle className="text-2xl font-bold">
                        {form?.formTitle || t('defaultFormTitle')}
                      </DialogTitle>
                    </DialogHeader>
                  </div>
                  <div className="p-8">
                    <Form form={form} locale={locale} />
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}
