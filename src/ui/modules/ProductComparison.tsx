'use client';
/**
 * TODO: Make highlight colors dynamic
 *
 * Currently using hardcoded colors:
 * - Light mode: bg=#FFF0F2, text=#E11D48
 * - Dark mode: bg=#1F0912, text=#FB7185
 *
 * These should be replaced with CSS variables in the future to:
 * 1. Ensure consistency with the global theme
 * 2. Support theme customization without code changes
 * 3. Better support for potential design system changes
 *
 * Consider adding these colors to the global CSS and using variables like:
 * - var(--highlight-bg-light)
 * - var(--highlight-bg-dark)
 * - var(--highlight-text-light)
 * - var(--highlight-text-dark)
 */
import { PortableText, PortableTextComponents } from 'next-sanity';
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
    return <span className={isHighlighted ? 'text-[#E11D48] dark:text-[#FB7185]' : ''}>✓</span>;
  }

  if (featureDetail === 'false') {
    return <span className={isHighlighted ? 'text-[#E11D48] dark:text-[#FB7185]' : ''}>✗</span>;
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
    <section className="section space-y-8">
      <div className="section-intro text-center items-center flex flex-col">
        {pretitle && <Pretitle className="mb-4">{pretitle}</Pretitle>}
        {intro && (
          <>
            <div className="text-4xl md:text-5xl lg:text-6xl font-bold text-center ">
              <PortableText value={[intro[0]]} />
            </div>
            <div className="mb-4" />
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
              {products?.map((product) => (
                <th
                  key={product._key || `product-${product.name}`}
                  className={`p-4 text-center font-bold rounded-t-lg ${
                    product.highlight
                      ? 'text-primary'
                      : 'text-muted-foreground'
                  }`}
                >
                  {product.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {features?.map((feature) => (
              <tr className="border-b" key={feature._key || `feature-${feature.name}`}>
                <td className="p-4 font-medium">{feature.name}</td>
                {feature.featureDetails?.map((featureDetail, idx) => {
                  const correspondingProduct = products?.[idx];
                  const isHighlighted = correspondingProduct?.highlight;

                  return (
                    <td
                      key={`${feature._key || feature.name}-detail-${idx}`}
                      className={`p-4 text-center font-semibold ${
                        isHighlighted
                          ? 'bg-[#FFF0F2] dark:bg-[#1F0912] text-[#E11D48] dark:text-[#FB7185]'
                          : ''
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
    </section>
  );
}
