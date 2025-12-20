'use client';
import { PortableText } from 'next-sanity';
import { Section } from '@/components/ui/section';
import Pretitle from '../Pretitle';

type ProductComparisonProps = {
  pretitle?: string;
  intro?: any[];
  products?: Array<{
    name: string;
    highlight: boolean;
    _key?: string;
  }>;
  features?: Array<{
    name: string;
    featureDetails: string[];
    _key?: string;
  }>;
  _type?: string;
  _key?: string;
};

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
  pretitle,
  intro,
  products,
  features,
}: ProductComparisonProps) {
  return (
    <Section className="space-y-8" width="wide">
      <div className="section-intro text-center items-center flex flex-col gap-4">
        {pretitle && <Pretitle>{pretitle}</Pretitle>}
        {intro && (
          <>
            <div className="text-4xl md:text-5xl lg:text-6xl font-bold text-center ">
              <PortableText value={[intro[0]]} />
            </div>
            {intro[1] && (
              <div className="text-lg md:text-xl text-center font-normal mx-auto max-w-2xl">
                <PortableText value={[intro[1]]} />
              </div>
            )}
            <PortableText value={intro.slice(2)} />
          </>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="p-4 text-left" />
              {products?.map((product, index) => (
                <th
                  key={product._key || `product-${product.name}-${index}`}
                  className={`p-4 text-center font-bold rounded-t-lg ${
                    product.highlight ? 'text-primary' : 'text-muted-foreground'
                  }`}
                >
                  {product.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {features?.map((feature, index) => (
              <tr className="border-b" key={feature._key || `feature-${feature.name}-${index}`}>
                <td className="p-4 font-medium">{feature.name}</td>
                {feature.featureDetails?.map((featureDetail, idx) => {
                  const correspondingProduct = products?.[idx];
                  const isHighlighted = correspondingProduct?.highlight;

                  return (
                    <td
                      key={`${feature._key || feature.name}-detail-${idx}`}
                      className={`p-4 text-center font-semibold ${
                        isHighlighted ? 'bg-accent text-accent-foreground' : ''
                      }`}
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
