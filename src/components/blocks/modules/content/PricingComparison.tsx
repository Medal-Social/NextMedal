import { Check, HelpCircle, X } from 'lucide-react';
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Section } from '@/components/ui/section';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import moduleProps from '@/lib/sanity/module-props';
import { cn } from '@/lib/utils/index';

// Define types based on schema
export default function PricingComparison({
  title,
  description,
  tiers,
  featureCategories,
  ...props
}: Sanity.PricingComparison) {
  return (
    <Section className="space-y-12" width="wide" {...moduleProps(props)}>
      <div className="space-y-4 text-center">
        {title && <h2 className="font-bold text-3xl md:text-4xl">{title}</h2>}
        {description && <p className="mx-auto max-w-2xl text-muted-foreground">{description}</p>}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px] border-collapse">
          <thead>
            <tr>
              <th className="w-1/4 p-4 text-left"></th>
              {tiers?.map((tier) => (
                <th
                  key={tier._key}
                  className={cn(
                    'min-w-[200px] p-4 text-center align-top',
                    tier.popular && 'relative rounded-t-xl bg-muted/30'
                  )}
                >
                  {tier.popular && (
                    <Badge className="absolute -top-3 left-1/2 mb-2 -translate-x-1/2">
                      Most Popular
                    </Badge>
                  )}
                  <div className="mt-2 space-y-2">
                    <div className="font-bold text-xl">{tier.name}</div>
                    <div className="font-bold text-2xl">{tier.price || 'Custom'}</div>
                    {tier.description && (
                      <div className="font-normal text-muted-foreground text-sm">
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
                    className="p-3 pl-4 font-semibold text-sm uppercase tracking-wider"
                  >
                    {category.category}
                  </td>
                </tr>
                {category.items?.map((feature) => (
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
  feature: NonNullable<
    NonNullable<Sanity.PricingComparison['featureCategories']>[number]['items']
  >[number];
  tiersCount: number;
  level?: number;
}) {
  return (
    <>
      <tr className="border-b hover:bg-muted/5">
        <td className="flex items-center gap-2 p-4">
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
                  <HelpCircle className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs text-sm">{feature.tooltip}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </td>
        {feature.tiers?.slice(0, tiersCount).map((value, i) => (
          <td
            // biome-ignore lint/suspicious/noArrayIndexKey: pricing tier columns have stable position
            key={`tier-${i}`}
            className="p-4 text-center"
          >
            {renderValue(value)}
          </td>
        ))}
        {/* Fill remaining cells if feature.tiers is shorter than tiersCount (shouldn't happen with valid data) */}
        {Array.from({ length: Math.max(0, tiersCount - (feature.tiers?.length || 0)) }).map(
          (_, i) => (
            <td
              // biome-ignore lint/suspicious/noArrayIndexKey: empty cell placeholders
              key={`empty-${i}`}
              className="p-4 text-center text-muted-foreground"
            >
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

function renderValue(value: string | boolean | null | undefined) {
  // Normalize value
  let resolved: string | boolean | null | undefined = value;

  // Handle case where value might be an object (though types say otherwise, Sanity sometimes provides them)
  if (typeof value === 'object' && value !== null) {
    const valObj = value as Record<string, unknown>;
    if ('title' in valObj && typeof valObj.title === 'string') {
      resolved = valObj.title;
    } else {
      resolved = null;
    }
  }

  // Normalize boolean strings
  if (resolved === 'true') resolved = true;
  if (resolved === 'false') resolved = false;

  // Render based on type
  if (resolved === true) {
    return <Check className="mx-auto h-5 w-5 text-primary" />;
  }

  if (resolved === false) {
    return <X className="mx-auto h-5 w-5 text-muted-foreground/30" />;
  }

  if (typeof resolved === 'string' && resolved.trim().length > 0) {
    return <span className="font-medium text-sm">{resolved}</span>;
  }

  // Default fallback for null, undefined, empty strings, or unhandled types
  return <span className="text-muted-foreground">-</span>;
}
