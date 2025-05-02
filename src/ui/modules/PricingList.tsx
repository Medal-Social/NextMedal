'use client';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import moduleProps from '@/lib/moduleProps';
import CTAList from '@/ui/CTAList';
import Pretitle from '@/ui/Pretitle';
import { animate, motion, useMotionValue, useTransform } from 'framer-motion';
import { CircleCheckBig } from 'lucide-react';
import { PortableText, type PortableTextComponents } from 'next-sanity';
import { useEffect, useState } from 'react';
const components: PortableTextComponents = {
  list: {
    bullet: ({ children }) => <ul className="space-y-2 my-4">{children}</ul>,
  },
  listItem: {
    bullet: ({ children }) => (
      <li className="flex items-start gap-2">
        <div className="h-5 w-5 mr-4 mt-1.5">
          <CircleCheckBig className="h-5 w-5 text-primary " />
        </div>
        <span className="mt-0">{children}</span>
      </li>
    ),
  },
};

export default function PricingList({
  pretitle,
  intro,
  tiers,
  ...props
}: Partial<{
  pretitle: string;
  intro: any;
  tiers: Sanity.Pricing[];
  isTabbedModule?: boolean;
}> &
  Sanity.Module) {
  const [isYearly, setIsYearly] = useState(false);
  return (
    <section
      className="section [&:first-child]:mt-8 md:[&:first-child]:mt-16 space-y-8"
      {...moduleProps(props)}
    >
      {(pretitle || intro) && (
        <header className="section-intro text-center items-center flex flex-col">
          <Pretitle className="mb-4">{pretitle}</Pretitle>
          <PortableText value={intro} />
        </header>
      )}
      {tiers?.find((tier) => tier.price?.yearly !== undefined) && (
        <div className="flex justify-center items-center space-x-4  rounded-full ">
          <Tabs
            onValueChange={(value) => setIsYearly(value === 'yearly')}
            defaultValue="monthly"
            className="border border-muted rounded-full"
          >
            <TabsList className="bg-background rounded-full">
              <TabsTrigger
                aria-controls={undefined}
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full"
                value="monthly"
              >
                Monthly
              </TabsTrigger>
              <TabsTrigger
                aria-controls={undefined}
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full"
                value="yearly"
              >
                Yearly (-20%)
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
                className="backdrop-blur-sm bg-card/30 p-8 rounded-lg border border-primary/10 hover:border-primary/20 transition-all duration-300 flex flex-col"
                key={tier._id}
              >
                <div className="text-2xl mb-4 flex items-center justify-between">
                  {tier.title}
                  {tier.highlight && (
                    <Badge className="text-xs text-primary-foreground ">{tier.highlight}</Badge>
                  )}
                </div>
                {tier.description && (
                  <p className="text-sm text-muted-foreground mb-4">{tier.description}</p>
                )}

                {tier.price?.base !== undefined && (
                  <div className="flex flex-wrap items-end gap-x-1 mb-6">
                    {tier.price.base !== undefined && tier.price.base && (
                      <span className="text-4xl text-foreground font-semibold">
                        {tier.price.currency}{' '}
                        {!Number.isNaN(Number.parseInt(tier.price.base)) &&
                        Number.parseInt(tier.price.base) > 0 &&
                        !Number.isNaN(Number.parseInt(tier.price.yearly || '0')) &&
                        Number.parseInt(tier.price.yearly || '0') > 0 ? (
                          <AnimatedNumber
                            value={
                              isYearly && tier.price?.yearly
                                ? Number.parseInt(tier.price.yearly)
                                : Number.parseInt(tier.price.base)
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

                <CTAList className="grid mb-6" ctas={tier.ctas} />
                <div className="hero">
                  <PortableText components={components} value={tier.content} />
                </div>
              </article>
            )
        )}
      </div>
    </section>
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
