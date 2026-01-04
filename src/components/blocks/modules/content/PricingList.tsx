'use client';

import { CircleCheckBig } from 'lucide-react';
import { animate, motion, useMotionValue, useTransform } from 'motion/react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import SharedPortableText from '@/components/blocks/modules/SharedPortableText';
import { CTAList } from '@/components/blocks/objects/cta';
import { Badge } from '@/components/ui/badge';
import { Section } from '@/components/ui/section';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import moduleProps from '@/lib/sanity/module-props';

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

const AnimatedNumber = ({ value }: { value: number }) => {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest));
  useEffect(() => {
    animate(count, value, { duration: 0.5 });
  }, [value, count]);
  return <motion.span>{rounded}</motion.span>;
};

function PricingPrice({
  tier,
  isYearly,
}: {
  tier: NonNullable<Sanity.PricingList['tiers']>[number];
  isYearly: boolean;
}) {
  if (tier.monthlyPrice === undefined) return null;

  const priceValue = isYearly && tier.yearlyPrice ? tier.yearlyPrice : tier.monthlyPrice;
  const priceNum = Number.parseInt(priceValue || '0', 10);
  const isValidPrice = !Number.isNaN(priceNum) && priceNum > 0;

  return (
    <div
      className="flex flex-wrap items-end gap-x-1"
      aria-live="polite"
      itemScope
      itemProp="offers"
      itemType="https://schema.org/Offer"
    >
      <meta itemProp="price" content={priceValue?.toString()} />
      <meta itemProp="priceCurrency" content={tier.currency || 'USD'} />
      {tier.monthlyPrice && (
        <span className="text-4xl text-foreground font-semibold font-numeric">
          {tier.currency} {isValidPrice ? <AnimatedNumber value={priceNum} /> : tier.monthlyPrice}
        </span>
      )}
      {tier.priceSuffix && (
        <span className="text-sm font-normal text-foreground">{tier.priceSuffix}</span>
      )}
    </div>
  );
}

function PricingTier({
  tier,
  isYearly,
}: {
  tier: NonNullable<Sanity.PricingList['tiers']>[number];
  isYearly: boolean;
}) {
  if (!tier) return null;

  return (
    <article
      className="backdrop-blur-sm bg-card/30 p-8 rounded-lg border border-primary/10 hover:border-primary/20 transition-colors duration-300 flex flex-col gap-6"
      itemScope
      itemType="https://schema.org/Product"
    >
      <meta itemProp="name" content={tier.title || ''} />
      {tier.description && <meta itemProp="description" content={tier.description} />}

      <div className="flex flex-col gap-2">
        <div className="text-2xl flex items-center justify-between">
          {tier.title}
          {tier.highlight && (
            <Badge className="text-xs text-primary-foreground ">{tier.highlight}</Badge>
          )}
        </div>
        {tier.description && <p className="text-sm text-muted-foreground">{tier.description}</p>}
      </div>

      <PricingPrice tier={tier} isYearly={isYearly} />

      <CTAList className="grid" ctas={tier.ctas} />
      <div className="prose prose-slate dark:prose-invert max-w-none">
        <SharedPortableText components={components} value={tier.content} />
      </div>
    </article>
  );
}

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
      {tiers?.find((tier) => tier.yearlyPrice !== undefined) && (
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
          (tier) => !!tier && <PricingTier key={tier._id} tier={tier} isYearly={isYearly} />
        )}
      </div>
    </Section>
  );
}
