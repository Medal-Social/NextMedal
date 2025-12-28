'use client';

import { animate, motion, useMotionValue, useTransform } from 'framer-motion';
import { CircleCheckBig } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Section } from '@/components/ui/section';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import moduleProps from '@/lib/moduleProps';
import CTAList from '@/ui/CTAList';
import SharedPortableText from '@/ui/modules/SharedPortableText';

interface BlockChildrenProps {
  children?: React.ReactNode;
}

const components = {
  list: {
    bullet: ({ children }: BlockChildrenProps) => <ul className="space-y-2 my-4">{children}</ul>,
  },
  listItem: {
    bullet: ({ children }: BlockChildrenProps) => (
      <li className="flex items-start gap-2">
        <div className="h-5 w-5 mr-4 mt-1.5">
          <CircleCheckBig className="h-5 w-5 text-primary " />
        </div>
        <span className="mt-0">{children}</span>
      </li>
    ),
  },
};

export default function PricingList({ intro, tiers, ...props }: Sanity.PricingList) {
  const t = useTranslations('modules.pricing');
  const [isYearly, setIsYearly] = useState(false);
  return (
    <Section className="space-y-8" {...moduleProps(props)}>
      {intro && (
        <header className="section-intro text-center items-center flex flex-col gap-4">
          <SharedPortableText value={intro} />
        </header>
      )}
      {tiers?.find((tier) => tier.price?.yearly !== undefined) && (
        <div className="flex justify-center items-center space-x-4 rounded-full">
          <Tabs
            onValueChange={(value) => setIsYearly(value === 'yearly')}
            defaultValue="monthly"
            className="border border-muted rounded-full"
          >
            <TabsList className="bg-background rounded-full">
              <TabsTrigger
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full"
                value="monthly"
              >
                {t('monthly')}
              </TabsTrigger>
              <TabsTrigger
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full"
                value="yearly"
              >
                {t('yearlyDiscount', { discount: 20 })}
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      )}

      <div
        className="max-md:carousel max-md:full-bleed max-md:flex max-md:flex-col grid grid-cols-[repeat(var(--col,1),1fr)] items-stretch gap-6 max-md:px-4"
        style={{ '--col': tiers?.length } as React.CSSProperties}
      >
        {tiers?.map(
          (tier) =>
            !!tier && (
              <article
                className="backdrop-blur-sm bg-card/30 p-8 rounded-lg border border-primary/10 hover:border-primary/20 transition-colors duration-300 flex flex-col gap-6"
                key={tier._id}
              >
                <div className="flex flex-col gap-2">
                  <div className="text-2xl flex items-center justify-between">
                    {tier.title}
                    {tier.highlight && (
                      <Badge className="text-xs text-primary-foreground ">{tier.highlight}</Badge>
                    )}
                  </div>
                  {tier.description && (
                    <p className="text-sm text-muted-foreground">{tier.description}</p>
                  )}
                </div>

                {tier.price?.base !== undefined && (
                  <div className="flex flex-wrap items-end gap-x-1" aria-live="polite">
                    {tier.price.base !== undefined && tier.price.base && (
                      <span className="text-4xl text-foreground font-semibold font-numeric">
                        {tier.price.currency}{' '}
                        {!Number.isNaN(Number.parseInt(tier.price.base, 10)) &&
                        Number.parseInt(tier.price.base, 10) > 0 &&
                        !Number.isNaN(Number.parseInt(tier.price.yearly || '0', 10)) &&
                        Number.parseInt(tier.price.yearly || '0', 10) > 0 ? (
                          <AnimatedNumber
                            value={
                              isYearly && tier.price?.yearly
                                ? Number.parseInt(tier.price.yearly, 10)
                                : Number.parseInt(tier.price.base, 10)
                            }
                          />
                        ) : (
                          tier.price.base
                        )}
                      </span>
                    )}
                    {tier.price.suffix && (
                      <span className="text-sm font-normal text-foreground">
                        {tier.price.suffix}
                      </span>
                    )}
                  </div>
                )}

                <CTAList className="grid" ctas={tier.ctas} />
                <div className="prose prose-slate dark:prose-invert max-w-none">
                  <SharedPortableText components={components} value={tier.content} />
                </div>
              </article>
            )
        )}
      </div>
    </Section>
  );
}

const AnimatedNumber = ({ value }: { value: number }) => {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest));
  useEffect(() => {
    animate(count, value, { duration: 0.5 });
  }, [value, count]);
  return <motion.span>{rounded}</motion.span>;
};
