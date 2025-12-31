/**
 * Sanity Mock Types
 * @description TypeScript interfaces for mock Sanity data structures
 */

// ============================================================================
// Base Types
// ============================================================================

export interface MockImage {
  _type: 'image';
  asset: {
    _ref: string;
    _type: 'reference';
  };
  hotspot?: {
    x: number;
    y: number;
    height: number;
    width: number;
  };
}

export interface MockImg {
  _type: 'img';
  image: MockImage;
}

export interface MockSlug {
  _type: 'slug';
  current: string;
}

export interface MockMetadata {
  slug: MockSlug;
  title: string;
}

export interface MockSeo {
  title?: string;
  description?: string;
  noIndex?: boolean;
  image?: MockImg;
}

export interface MockPortableTextBlock {
  _type: 'block';
  _key: string;
  style: 'normal' | 'h1' | 'h2' | 'h3' | 'h4' | 'blockquote';
  children: Array<{
    _type: 'span';
    _key: string;
    text: string;
    marks?: string[];
  }>;
  markDefs?: Array<{
    _type: string;
    _key: string;
    [key: string]: unknown;
  }>;
}

export interface MockCta {
  _type: 'cta';
  _key: string;
  link: MockMenuItem;
  style?: 'primary' | 'ghost' | 'link';
}

export interface MockIcon {
  _type: 'icon';
  name: string;
}

export interface MockMenuItem {
  _type: 'menuItem';
  _key: string;
  type: 'internal' | 'external';
  label?: string;
  internalLink?: { _ref: string; _type: 'reference' };
  externalLink?: string;
}

export interface MockStat {
  _type: 'stat';
  _key: string;
  value: string;
  label: string;
  icon?: MockIcon;
}

export interface MockModuleOptions {
  uid?: string;
}

// ============================================================================
// Document Types
// ============================================================================

export interface MockPage {
  _id: string;
  _type: 'page';
  _createdAt: string;
  _updatedAt: string;
  _rev: string;
  language?: string;
  title: string;
  modules?: MockModule[];
  metadata: MockMetadata;
  seo?: MockSeo;
}

export interface MockBlogPost {
  _id: string;
  _type: 'collection.blog';
  _createdAt: string;
  _updatedAt: string;
  _rev: string;
  language?: string;
  body?: MockPortableTextBlock[];
  categories?: Array<{ _ref: string; _type: 'reference' }>;
  authors?: Array<{ _ref: string; _type: 'reference' }>;
  publishDate: string;
  featured?: 'standard' | 'featured';
  metadata: MockMetadata;
  seo?: MockSeo;
  collection?: {
    _id: string;
    metadata?: {
      slug?: { current: string };
      title?: string;
    };
  };
}

export interface MockBlogCategory {
  _id: string;
  _type: 'blog.category';
  _createdAt: string;
  _updatedAt: string;
  _rev: string;
  title: string;
  slug: MockSlug;
}

export interface MockPerson {
  _id: string;
  _type: 'person';
  _createdAt: string;
  _updatedAt: string;
  _rev: string;
  name: string;
  title?: string;
  image?: MockImage;
  socialLinks?: Array<{
    _key: string;
    platform: 'linkedin' | 'twitter' | 'instagram' | 'youtube' | 'facebook';
    url: string;
  }>;
}

export interface MockSocialLink {
  _type: 'social-link';
  _key: string;
  text: string;
  url: string;
}

export interface MockSite {
  _id: string;
  _type: 'site';
  _createdAt: string;
  _updatedAt: string;
  _rev: string;
  language?: string;
  title: string;
  tagline?: MockPortableTextBlock[];
  logo?: {
    default?: MockImage;
    light?: MockImage;
    dark?: MockImage;
  };
  headerMenu?: { _ref: string; _type: 'reference' };
  footerMenu?: { _ref: string; _type: 'reference' };
  ctas?: MockCta[];
  copyright?: MockPortableTextBlock[];
  socialLinks?: MockSocialLink[];
}

// ============================================================================
// Module Types
// ============================================================================

export interface MockHeroModule {
  _type: 'hero';
  _key: string;
  options?: { uid?: string };
  content?: MockPortableTextBlock[];
  ctas?: MockCta[];
  videoType?: 'image' | 'mux' | 'youtube';
  image?: MockImg;
  videoUrl?: string;
}

export interface MockCalloutModule {
  _type: 'callout';
  _key: string;
  uid?: string;
  content?: MockPortableTextBlock[];
  ctas?: MockCta[];
}

export interface MockAccordionItem {
  _type: 'accordion-item';
  _key: string;
  summary: string;
  content: MockPortableTextBlock[];
  open?: boolean;
}

export interface MockAccordionListModule {
  _type: 'accordion-list';
  _key: string;
  options?: MockModuleOptions;
  content?: MockPortableTextBlock[];
  items?: MockAccordionItem[];
  generateSchema?: boolean;
}

export interface MockLatestArticlesModule {
  _type: 'latest-articles';
  _key: string;
  pretitle?: string;
  intro?: MockPortableTextBlock[];
  layout?: 'grid' | 'carousel';
  showFeaturedPostsFirst?: boolean;
  displayFilters?: boolean;
  limit?: number;
  filteredCategory?: { _ref: string; _type: 'reference' };
}

export interface MockBreadcrumbsModule {
  _type: 'breadcrumbs';
  _key: string;
  crumbs?: MockMenuItem[];
  hideCurrent?: boolean;
}

export interface MockFeatureItem {
  _type: 'feature-item';
  _key: string;
  icon?: MockIcon;
  summary: string;
  content: MockPortableTextBlock[];
  link?: MockMenuItem;
}

export interface MockFeaturesModule {
  _type: 'features';
  _key: string;
  options?: MockModuleOptions;
  pretitle?: string;
  intro?: MockPortableTextBlock[];
  items?: MockFeatureItem[];
}

export interface MockLogoCloudModule {
  _type: 'logo-cloud';
  _key: string;
  options?: { uid?: string };
  content?: MockPortableTextBlock[];
  logos?: Array<{ _ref: string; _type: 'reference' }>;
}

export interface MockTeamModule {
  _type: 'team';
  _key: string;
  options?: { uid?: string };
  pretitle?: string;
  intro?: MockPortableTextBlock[];
  people?: Array<{ _ref: string; _type: 'reference' }>;
  layout?: 'grid' | 'carousel';
}

export interface MockPricingTier {
  _type: 'pricing-tier';
  _key: string;
  name: string;
  price?: string;
  description?: string;
  cta?: MockCta;
  popular?: boolean;
}

export interface MockComparisonSubFeature {
  _type: 'comparison-sub-feature';
  _key: string;
  name: string;
  tooltip?: string;
  tiers: Array<string | boolean>;
}

export interface MockPricingFeature {
  _type: 'comparison-feature';
  _key: string;
  name: string;
  tooltip?: string;
  tiers: Array<string | boolean>;
  subItems?: MockComparisonSubFeature[];
}

export interface MockFeatureCategory {
  _type: 'feature-category';
  _key: string;
  category: string;
  items: MockPricingFeature[];
}

export interface MockPricingComparisonModule {
  _type: 'pricing-comparison';
  _key: string;
  options?: MockModuleOptions;
  title?: string;
  description?: string;
  tiers?: MockPricingTier[];
  featureCategories?: MockFeatureCategory[];
}

export interface MockPricingListModule {
  _type: 'pricing-list';
  _key: string;
  options?: MockModuleOptions;
  pretitle?: string;
  intro?: MockPortableTextBlock[];
  tiers?: Array<{ _ref: string; _type: 'reference' }>;
}

export interface MockComparisonProduct {
  _type: 'comparison-product';
  _key: string;
  name: string;
  highlight?: boolean;
}

export interface MockComparisonFeatureRow {
  _type: 'comparison-feature-row';
  _key: string;
  name: string;
  featureDetails?: string[];
}

export interface MockProductComparisonModule {
  _type: 'product-comparison';
  _key: string;
  pretitle?: string;
  intro?: MockPortableTextBlock[];
  products?: MockComparisonProduct[];
  features?: MockComparisonFeatureRow[];
}

export interface MockRichtextModule {
  _type: 'richtext';
  _key: string;
  options?: MockModuleOptions;
  content?: MockPortableTextBlock[];
}

export interface MockVideoHeroModule {
  _type: 'videoHero';
  _key: string;
  uid?: string;
  title: string;
  type: 'mux' | 'youtube';
  videoId?: string;
  thumbnail: MockImage;
}

export interface MockComponentGroup {
  _type: 'component-group';
  _key: string;
  title: string;
  items: MockModule[];
}

export interface MockComponentGalleryModule {
  _type: 'component-gallery';
  _key: string;
  intro?: MockPortableTextBlock[];
  groups?: MockComponentGroup[];
}

// Union type for all modules
export type MockModule =
  | MockHeroModule
  | MockCalloutModule
  | MockAccordionListModule
  | MockLatestArticlesModule
  | MockBreadcrumbsModule
  | MockFeaturesModule
  | MockLogoCloudModule
  | MockTeamModule
  | MockPricingComparisonModule
  | MockPricingListModule
  | MockProductComparisonModule
  | MockRichtextModule
  | MockVideoHeroModule
  | MockComponentGalleryModule;
