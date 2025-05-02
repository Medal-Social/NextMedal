import type { SchemaTypeDefinition } from 'sanity';

// documents
import blogCategory from './documents/blog.category';
import blogPost from './documents/blog.post';
import globalModule from './documents/global-module';

import navigation from './documents/navigation';
import page from './documents/page';
import redirect from './documents/redirect';
import site from './documents/site';

// miscellaneous
import announcement from './misc/announcement';
import logo from './misc/logo';
import person from './misc/person';
import pricing from './misc/pricing';
import theme from './misc/theme';

// objects
import modules from './fragments/modules';
import cta from './objects/cta';
import icon from './objects/icon';
import img from './objects/img';
import link from './objects/link';
import linkCategories from './objects/link.categories';
import linkCategoriesList from './objects/link.categories.list';
import linkList from './objects/link.list';
import metadata from './objects/metadata';
import moduleOptions from './objects/module-options';
import stat from './objects/stat';

// modules
import helpPage from './documents/help-page';
import accordionList from './modules/accordion-list';
import blogFrontpage from './modules/blog-frontpage';
import blogList from './modules/blog-list';
import blogPostContent from './modules/blog-post-content';
import breadcrumbs from './modules/breadcrumbs';
import callout from './modules/callout';

import featureGrid from './modules/feature-grid';
import featuredHero from './modules/featured-hero';
import galleryHero from './modules/gallery-hero';
import hero from './modules/hero';
import logoList from './modules/logo-list';

import personList from './modules/person-list';
import pricingComparison from './modules/pricing-comparison';
import pricingList from './modules/pricing-list';
import richtextModule from './modules/richtext-module';
import tabbedContent from './modules/tabbed-content';
import videoHero from './modules/video-hero';

export const schemaTypes: SchemaTypeDefinition[] = [
  // documents
  blogCategory,
  blogPost,
  globalModule,
  page,
  redirect,
  site,
  navigation,

  // miscellaneous
  announcement,
  logo,
  person,
  pricing,
  theme,

  // objects
  cta,
  icon,
  img,
  link,
  linkCategories,
  linkCategoriesList,
  linkList,
  metadata,
  moduleOptions,
  stat,
  modules,

  // modules
  accordionList,
  blogFrontpage,
  blogList,
  blogPostContent,
  breadcrumbs,
  callout,
  featuredHero,
  galleryHero,
  featureGrid,

  hero,
  logoList,

  personList,
  pricingComparison,
  pricingList,
  richtextModule,
  tabbedContent,
  videoHero,
];
