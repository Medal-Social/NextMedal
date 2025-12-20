import { Check, HelpCircle, X } from 'lucide-react';
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Section } from '@/components/ui/section';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import moduleProps from '@/lib/moduleProps';
import { cn } from '@/lib/utils';

// Define types based on schema
type Tier = {
  _key: string;
  name: string;
  price?: string;
  description?: string;
  popular?: boolean;
  cta?: any; // Sanity CTA type
};

type FeatureTier =
  | {
      type: 'string' | 'boolean';
      title: string | boolean;
    }
  | string
  | boolean;

type FeatureItem = {
  _key: string;
  name: string;
  tooltip?: string;
  tiers: FeatureTier[];
  subItems?: FeatureItem[];
};

type FeatureCategory = {
  _key: string;
  category: string;
  items: FeatureItem[];
};

type PricingComparisonProps = {
  title?: string;
  description?: string;
  tiers?: Tier[];
  featureCategories?: FeatureCategory[];
} & Sanity.Module;

export default function PricingComparison({
  title,
  description,
  tiers,
  featureCategories,
  ...props
}: PricingComparisonProps) {
  return (
    <Section className="space-y-12" width="wide" {...moduleProps(props)}>
      <div className="text-center space-y-4">
        {title && <h2 className="text-3xl font-bold md:text-4xl">{title}</h2>}
        {description && <p className="text-muted-foreground max-w-2xl mx-auto">{description}</p>}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse min-w-[800px]">
          <thead>
            <tr>
              <th className="p-4 text-left w-1/4"></th>
              {tiers?.map((tier) => (
                <th
                  key={tier._key}
                  className={cn(
                    'p-4 text-center align-top min-w-[200px]',
                    tier.popular && 'bg-muted/30 rounded-t-xl relative'
                  )}
                >
                  {tier.popular && (
                    <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 mb-2">
                      Most Popular
                    </Badge>
                  )}
                  <div className="space-y-2 mt-2">
                    <div className="font-bold text-xl">{tier.name}</div>
                    <div className="text-2xl font-bold">{tier.price || 'Custom'}</div>
                    {tier.description && (
                      <div className="text-sm text-muted-foreground font-normal">
                        {tier.description}
                      </div>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {featureCategories?.map((category) => (
              <React.Fragment key={category._key}>
                <tr className="bg-muted/50">
                  <td
                    colSpan={(tiers?.length || 0) + 1}
                    className="p-3 font-semibold text-sm uppercase tracking-wider pl-4"
                  >
                    {category.category}
                  </td>
                </tr>
                {category.items.map((feature) => (
                  <FeatureRow
                    key={feature._key}
                    feature={feature}
                    tiersCount={tiers?.length || 0}
                  />
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </Section>
  );
}

function FeatureRow({
  feature,
  tiersCount,
  level = 0,
}: {
  feature: FeatureItem;
  tiersCount: number;
  level?: number;
}) {
  return (
    <>
      <tr className="border-b hover:bg-muted/5">
        <td className="p-4 flex items-center gap-2">
          <span
            style={{ marginLeft: `${level * 1.5}rem` }}
            className={cn(level > 0 && 'text-muted-foreground')}
          >
            {feature.name}
          </span>
          {feature.tooltip && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <HelpCircle className="w-4 h-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs text-sm">{feature.tooltip}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </td>
        {feature.tiers?.map((value, i) => (
          <td key={i} className="p-4 text-center">
            {renderValue(value)}
          </td>
        ))}
        {/* Fill remaining cells if feature.tiers is shorter than tiersCount (shouldn't happen with valid data) */}
        {Array.from({ length: Math.max(0, tiersCount - (feature.tiers?.length || 0)) }).map(
          (_, i) => (
            <td key={`empty-${i}`} className="p-4 text-center text-muted-foreground">
              -
            </td>
          )
        )}
      </tr>
      {feature.subItems?.map((subItem) => (
        <FeatureRow
          key={subItem._key}
          feature={subItem}
          tiersCount={tiersCount}
          level={level + 1}
        />
      ))}
    </>
  );
}

function renderValue(value: FeatureTier) {
  let actualValue: string | boolean;

  if (typeof value === 'object' && value !== null && 'title' in value) {
    actualValue = value.title;
  } else {
    actualValue = value as string | boolean;
  }

  // Safety check: if actualValue is still an object, try to extract title or stringify, or return null to avoid React error
  if (typeof actualValue === 'object' && actualValue !== null) {
    if ('title' in (actualValue as any)) {
      actualValue = (actualValue as any).title;
    } else {
      console.error('Invalid value in PricingComparison renderValue:', value);
      return null;
    }
  }

  if (typeof actualValue === 'boolean') {
    return actualValue ? (
      <Check className="w-5 h-5 text-primary mx-auto" />
    ) : (
      <X className="w-5 h-5 text-muted-foreground/30 mx-auto" />
    );
  }
  if (actualValue === 'true') return <Check className="w-5 h-5 text-primary mx-auto" />;
  if (actualValue === 'false') return <X className="w-5 h-5 text-muted-foreground/30 mx-auto" />;

  return <span className="text-sm font-medium">{actualValue}</span>;
}
