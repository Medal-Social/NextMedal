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
  description: string;
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
  text: string;
  linkType: 'internal' | 'external';
  internalLink?: { _ref: string; _type: 'reference' };
  externalLink?: string;
  style?: 'default' | 'secondary' | 'outline' | 'ghost' | 'link' | 'destructive';
  size?: 'default' | 'sm' | 'lg';
  newTab?: boolean;
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
}

export interface MockBlogPost {
  _id: string;
  _type: 'blog.post';
  _createdAt: string;
  _updatedAt: string;
  _rev: string;
  language?: string;
  body?: MockPortableTextBlock[];
  categories?: Array<{ _ref: string; _type: 'reference' }>;
  authors?: Array<{ _ref: string; _type: 'reference' }>;
  publishDate: string;
  featured?: boolean;
  metadata: MockMetadata;
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
  socialLinks?: Array<{ text: string; url: string }>;
}

// ============================================================================
// Module Types
// ============================================================================

export interface MockHeroModule {
  _type: 'hero';
  _key: string;
  options?: { uid?: string };
  content?: MockPortableTextBlock[];
  ctas?: Array<{
    _key: string;
    text: string;
    linkType: 'internal' | 'external';
    internalLink?: { _ref: string; _type: 'reference' };
    externalLink?: string;
    style?: 'default' | 'outline';
  }>;
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

export interface MockAccordionListModule {
  _type: 'accordion-list';
  _key: string;
  options?: MockModuleOptions;
  content?: MockPortableTextBlock[];
  items?: Array<{
    _key: string;
    summary: string;
    content: MockPortableTextBlock[];
    open?: boolean;
  }>;
  generateSchema?: boolean;
}

export interface MockBlogFrontpageModule {
  _type: 'blog-frontpage';
  _key: string;
  mainPost?: 'recent' | 'featured';
  showFeaturedPostsFirst?: boolean;
  itemsPerPage?: number;
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

export interface MockFeaturesModule {
  _type: 'features';
  _key: string;
  options?: MockModuleOptions;
  pretitle?: string;
  intro?: MockPortableTextBlock[];
  items?: Array<{
    _key: string;
    icon?: MockIcon;
    summary: string;
    content: MockPortableTextBlock[];
    link?: MockMenuItem;
  }>;
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
  _key: string;
  name: string;
  price?: string;
  description?: string;
  cta?: MockCta;
  popular?: boolean;
}

export interface MockPricingFeature {
  _key: string;
  name: string;
  tooltip?: string;
  tiers: Array<string | boolean>;
  subItems?: Array<{
    _key: string;
    name: string;
    tooltip?: string;
    tiers: Array<string | boolean>;
  }>;
}

export interface MockPricingComparisonModule {
  _type: 'pricing-comparison';
  _key: string;
  options?: MockModuleOptions;
  title?: string;
  description?: string;
  tiers?: MockPricingTier[];
  featureCategories?: Array<{
    _key: string;
    category: string;
    items: MockPricingFeature[];
  }>;
}

export interface MockPricingListModule {
  _type: 'pricing-list';
  _key: string;
  options?: MockModuleOptions;
  pretitle?: string;
  intro?: MockPortableTextBlock[];
  tiers?: Array<{ _ref: string; _type: 'reference' }>;
}

export interface MockProductComparisonModule {
  _type: 'product-comparison';
  _key: string;
  pretitle?: string;
  intro?: MockPortableTextBlock[];
  products?: Array<{
    _key: string;
    name: string;
    highlight?: boolean;
  }>;
  features?: Array<{
    _key: string;
    name: string;
    featureDetails?: string[];
  }>;
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

export interface MockComponentGalleryModule {
  _type: 'component-gallery';
  _key: string;
  intro?: MockPortableTextBlock[];
  groups?: Array<{
    _key: string;
    title: string;
    items: MockModule[];
  }>;
}

// Union type for all modules
export type MockModule =
  | MockHeroModule
  | MockCalloutModule
  | MockAccordionListModule
  | MockBlogFrontpageModule
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
