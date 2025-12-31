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
  const sortedProducts = products
    ? [...products]
        .map((product, index) => ({ ...product, originalIndex: index }))
        .sort((a, b) => (a.highlight === b.highlight ? 0 : a.highlight ? -1 : 1))
    : [];

  return (
    <Section className="space-y-8" width="wide" {...moduleProps(props)}>
      <div className="section-intro text-center items-center flex flex-col gap-4">
        {intro && (
          <>
            <div className="text-4xl md:text-5xl lg:text-6xl font-bold text-center ">
              <SharedPortableText value={[intro[0]]} />
            </div>
            {intro[1] && (
              <div className="text-lg md:text-xl text-center font-normal mx-auto max-w-2xl">
                <SharedPortableText value={[intro[1]]} />
              </div>
            )}
            <SharedPortableText value={intro.slice(2)} />
          </>
        )}
      </div>

      <div className="md:hidden space-y-8">
        {sortedProducts.map((product) => (
          <div
            key={product._key || `mobile-product-${product.originalIndex}`}
            className={cn(
              'rounded-xl border p-6 space-y-6',
              product.highlight
                ? 'border-primary bg-primary/5 shadow-lg relative overflow-hidden'
                : 'bg-card'
            )}
          >
            {product.highlight && (
              <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-bl-lg">
                Recommended
              </div>
            )}

            <div className="text-center pb-4 border-b border-border/50">
              <h3
                className={cn(
                  'text-2xl font-bold',
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
                  className="flex justify-between items-start gap-4 text-sm"
                >
                  <span
                    className={cn(
                      'font-medium shrink-0 max-w-[40%]',
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

      <div className="hidden md:block overflow-x-auto rounded-xl border border-border dark:border-border/80 bg-card/50 dark:bg-card/80 backdrop-blur-sm">
        <table className="w-full border-collapse min-w-[600px]">
          <thead>
            <tr>
              <th className="p-6 text-left w-1/4 bg-muted/50 dark:bg-muted/30">
                <span className="sr-only">Feature</span>
              </th>
              {products?.map((product, index) => (
                <th
                  key={product._key || `product-${product.name}-${index}`}
                  className={cn(
                    'p-6 text-center text-lg font-bold',
                    product.highlight
                      ? 'text-primary bg-primary/10 dark:bg-primary/20 border-b-2 border-primary'
                      : 'text-foreground border-b border-border dark:border-border/70 bg-muted/50 dark:bg-muted/30'
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
                className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors"
                key={feature._key || `feature-${feature.name}-${index}`}
              >
                <td className="p-6 font-medium text-foreground">{feature.name}</td>
                {feature.featureDetails?.map((featureDetail, idx) => {
                  const correspondingProduct = products?.[idx];
                  const isHighlighted = correspondingProduct?.highlight;

                  return (
                    <td
                      key={`${feature._key || feature.name}-detail-${idx}`}
                      className={cn(
                        'p-6 text-center font-medium',
                        isHighlighted
                          ? 'bg-primary/5 text-foreground font-bold'
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
