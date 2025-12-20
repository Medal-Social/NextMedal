import blogPostSchema from '@/sanity/schemaTypes/documents/blog.post';
import globalModuleSchema from '@/sanity/schemaTypes/documents/global-module';
import navigationSchema from '@/sanity/schemaTypes/documents/navigation';
import redirectSchema from '@/sanity/schemaTypes/documents/redirect';
import siteSchema from '@/sanity/schemaTypes/documents/site';
import bannerSchema from '@/sanity/schemaTypes/misc/banner';
import logoSchema from '@/sanity/schemaTypes/misc/logo';
import personSchema from '@/sanity/schemaTypes/misc/person';
import pricingSchema from '@/sanity/schemaTypes/misc/pricing';
import accordionListSchema from '@/sanity/schemaTypes/modules/accordion-list';
import blogFrontpageSchema from '@/sanity/schemaTypes/modules/blog-frontpage';
import breadcrumbsSchema from '@/sanity/schemaTypes/modules/breadcrumbs';
import calloutSchema from '@/sanity/schemaTypes/modules/callout';
import componentGallerySchema from '@/sanity/schemaTypes/modules/component-gallery';
import featuresSchema from '@/sanity/schemaTypes/modules/features';
import heroSchema from '@/sanity/schemaTypes/modules/hero';
import latestArticlesSchema from '@/sanity/schemaTypes/modules/latest-articles';
import logoCloudSchema from '@/sanity/schemaTypes/modules/logo-cloud';
import pricingComparisonSchema from '@/sanity/schemaTypes/modules/pricing-comparison';
import pricingListSchema from '@/sanity/schemaTypes/modules/pricing-list';
import productComparisonSchema from '@/sanity/schemaTypes/modules/productComparison';
import teamSchema from '@/sanity/schemaTypes/modules/team';
import richtextModuleSchema from '@/sanity/schemaTypes/modules/text';
import videoHeroSchema from '@/sanity/schemaTypes/modules/video-hero';

export const schemaMap: Record<string, string> = {
  hero: 'hero.ts',
  features: 'features.ts',
  'logo-cloud': 'logo-cloud.ts',
  'product-comparison': 'productComparison.ts',
  'pricing-comparison': 'pricing-comparison.ts',
  team: 'team.ts',
  'pricing-list': 'pricing-list.ts',
  'accordion-list': 'accordion-list.ts',
  callout: 'callout.ts',
  richtext: 'text.ts',
  videoHero: 'video-hero.ts',
  breadcrumbs: 'breadcrumbs.ts',
  'component-gallery': 'component-gallery.ts',
  'blog-frontpage': 'blog-frontpage.ts',
  'latest-articles': 'latest-articles.ts',
  'blog.post': '../documents/blog.post.ts',
  banner: '../misc/banner.ts',
  site: '../documents/site.ts',
  redirect: '../documents/redirect.tsx',
  navigation: '../documents/navigation.ts',
  'global-module': '../documents/global-module.ts',
  pricing: '../misc/pricing.ts',
  person: '../misc/person.ts',
  logo: '../misc/logo.ts',
};

export const schemaObjects: Record<string, any> = {
  hero: heroSchema,
  features: featuresSchema,
  'logo-cloud': logoCloudSchema,
  'product-comparison': productComparisonSchema,
  'pricing-comparison': pricingComparisonSchema,
  team: teamSchema,
  'pricing-list': pricingListSchema,
  'accordion-list': accordionListSchema,
  callout: calloutSchema,
  richtext: richtextModuleSchema,
  videoHero: videoHeroSchema,
  breadcrumbs: breadcrumbsSchema,
  'component-gallery': componentGallerySchema,
  'blog-frontpage': blogFrontpageSchema,
  'latest-articles': latestArticlesSchema,
  'blog.post': blogPostSchema,
  banner: bannerSchema,
  site: siteSchema,
  redirect: redirectSchema,
  navigation: navigationSchema,
  'global-module': globalModuleSchema,
  pricing: pricingSchema,
  person: personSchema,
  logo: logoSchema,
};

export function sanitizeSchema(obj: any, visited = new WeakSet<any>()): any {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj === 'function') {
    return `[Function: ${obj.name || 'anonymous'}]`;
  }

  if (typeof obj !== 'object') {
    return obj;
  }

  // Handle Sanity icon components which might be objects
  if (obj.$$typeof) {
    return '[Icon Component]';
  }

  if (visited.has(obj)) {
    return '[Circular]';
  }

  visited.add(obj);

  if (Array.isArray(obj)) {
    const result = obj.map((item) => sanitizeSchema(item, visited));
    visited.delete(obj);
    return result;
  }

  const newObj: any = {};
  for (const key in obj) {
    if (Object.hasOwn(obj, key)) {
      newObj[key] = sanitizeSchema(obj[key], visited);
    }
  }
  visited.delete(obj);
  return newObj;
}
