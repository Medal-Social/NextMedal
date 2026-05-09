'use client';

import SharedPortableText from '@/components/blocks/modules/SharedPortableText';
import { Section } from '@/components/ui/section';
import moduleProps from '@/lib/sanity/module-props';
import { cn } from '@/lib/utils/index';

/**
 * Renders the appropriate content for a feature detail cell
 */
function renderFeatureDetail(featureDetail: string, isHighlighted: boolean) {
  if (featureDetail === 'true') {
    return <span className={isHighlighted ? 'text-highlight-foreground' : ''}>✓</span>;
  }

  if (featureDetail === 'false') {
    return <span className={isHighlighted ? 'text-highlight-foreground' : ''}>✗</span>;
  }

  return featureDetail;
}

export default function ProductComparison({
  intro,
  products,
  features,
  ...props
}: Sanity.ProductComparison) {
  const sortedProducts = (() => {
    if (!products) return [];
    const compareHighlight = (a: { highlight?: boolean }, b: { highlight?: boolean }) => {
      if (a.highlight === b.highlight) return 0;
      return a.highlight ? -1 : 1;
    };
    return [...products]
      .map((product, index) => ({ ...product, originalIndex: index }))
      .sort(compareHighlight);
  })();

  return (
    <Section className="space-y-8" width="wide" {...moduleProps(props)}>
      <div className="section-intro flex flex-col items-center gap-4 text-center">
        {intro && (
          <>
            <div className="text-center font-bold text-4xl md:text-5xl lg:text-6xl">
              <SharedPortableText value={[intro[0]]} />
            </div>
            {intro[1] && (
              <div className="mx-auto max-w-2xl text-center font-normal text-lg md:text-xl">
                <SharedPortableText value={[intro[1]]} />
              </div>
            )}
            <SharedPortableText value={intro.slice(2)} />
          </>
        )}
      </div>

      <div className="space-y-8 md:hidden">
        {sortedProducts.map((product) => (
          <div
            key={product._key || `mobile-product-${product.originalIndex}`}
            className={cn(
              'space-y-6 rounded-xl border p-6',
              product.highlight
                ? 'relative overflow-hidden border-primary bg-primary/5 shadow-lg'
                : 'bg-card'
            )}
          >
            {product.highlight && (
              <div className="absolute top-0 right-0 rounded-bl-lg bg-primary px-3 py-1 font-bold text-primary-foreground text-xs">
                Recommended
              </div>
            )}

            <div className="border-border/50 border-b pb-4 text-center">
              <h3
                className={cn(
                  'font-bold text-2xl',
                  product.highlight ? 'text-highlight-foreground' : ''
                )}
              >
                {product.name}
              </h3>
            </div>

            <div className="space-y-4">
              {features?.map((feature, featureIndex) => (
                <div
                  key={feature._key || `mobile-feature-${featureIndex}`}
                  className="flex items-start justify-between gap-4 text-sm"
                >
                  <span
                    className={cn(
                      'max-w-[40%] shrink-0 font-medium',
                      product.highlight ? 'text-foreground/70' : 'text-muted-foreground'
                    )}
                  >
                    {feature.name}
                  </span>
                  <span
                    className={cn(
                      'text-right font-semibold',
                      product.highlight ? 'text-foreground' : ''
                    )}
                  >
                    {renderFeatureDetail(
                      feature.featureDetails?.[product.originalIndex] || '-',
                      !!product.highlight
                    )}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="hidden overflow-x-auto rounded-xl border border-border bg-card/50 backdrop-blur-sm md:block dark:border-border/80 dark:bg-card/80">
        <table className="w-full min-w-[600px] border-collapse">
          <thead>
            <tr>
              <th className="w-1/4 bg-muted/50 p-6 text-left dark:bg-muted/30">
                <span className="sr-only">Feature</span>
              </th>
              {products?.map((product, index) => (
                <th
                  key={product._key || `product-${product.name}-${index}`}
                  className={cn(
                    'p-6 text-center font-bold text-lg',
                    product.highlight
                      ? 'border-primary border-b-2 bg-primary/10 text-primary dark:bg-primary/20'
                      : 'border-border border-b bg-muted/50 text-foreground dark:border-border/70 dark:bg-muted/30'
                  )}
                >
                  {product.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {features?.map((feature, index) => (
              <tr
                className="border-border/50 border-b transition-colors last:border-0 hover:bg-muted/30"
                key={feature._key || `feature-${feature.name}-${index}`}
              >
                <td className="p-6 font-medium text-foreground">{feature.name}</td>
                {feature.featureDetails?.map((featureDetail, idx) => {
                  const correspondingProduct = products?.[idx];
                  const isHighlighted = correspondingProduct?.highlight;

                  return (
                    <td
                      // biome-ignore lint/suspicious/noArrayIndexKey: product detail aligns with column position
                      key={`${feature._key || feature.name}-detail-${idx}`}
                      className={cn(
                        'p-6 text-center font-medium',
                        isHighlighted
                          ? 'bg-primary/5 font-bold text-foreground'
                          : 'text-muted-foreground'
                      )}
                    >
                      {renderFeatureDetail(featureDetail, !!isHighlighted)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Section>
  );
}
