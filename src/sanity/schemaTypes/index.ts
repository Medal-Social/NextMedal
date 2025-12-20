import type { SchemaTypeDefinition } from 'sanity';

// documents
import blogCategory from './documents/blog.category';
import blogPost from './documents/blog.post';
// import componentLibrary from './documents/component-library';
import globalModule from './documents/global-module';

import navigation from './documents/navigation';
import page from './documents/page';
import redirect from './documents/redirect';
import site from './documents/site';
// objects
import modules from './fragments/modules';
// miscellaneous
import banner from './misc/banner';
import logo from './misc/logo';
import person from './misc/person';
import pricing from './misc/pricing';
// modules
import accordionList from './modules/accordion-list';
import blogFrontpage from './modules/blog-frontpage';
import blogList from './modules/blog-list';
import breadcrumbs from './modules/breadcrumbs';
import callout from './modules/callout';
import componentGallery from './modules/component-gallery';
import features from './modules/features';
import hero from './modules/hero';
import latestArticles from './modules/latest-articles';
import logoCloud from './modules/logo-cloud';
import logoList from './modules/logo-list';
import pricingComparison from './modules/pricing-comparison';
import pricingList from './modules/pricing-list';
import productComparison from './modules/productComparison';
import team from './modules/team';
import teamList from './modules/team-list';
import text from './modules/text';
import videoHero from './modules/video-hero';
import cta from './objects/cta';
import dropdownMenu from './objects/dropdown-menu';
import icon from './objects/icon';
import img from './objects/img';
import menuItem from './objects/menu-item';
import metadata from './objects/metadata';
import moduleOptions from './objects/module-options';
import stat from './objects/stat';

export const schemaTypes: SchemaTypeDefinition[] = [
  // documents
  blogCategory,
  blogPost,
  // componentLibrary,
  globalModule,
  page,
  redirect,
  site,
  navigation,

  // miscellaneous
  banner,
  logo,
  person,
  pricing,

  // objects
  cta,
  icon,
  img,
  menuItem,
  dropdownMenu,
  metadata,
  moduleOptions,
  stat,
  modules,

  // modules
  accordionList,
  blogFrontpage,
  blogList,
  latestArticles,
  breadcrumbs,
  callout,
  componentGallery,
  features,
  hero,
  logoCloud,
  logoList,

  team,
  teamList,
  pricingComparison,
  pricingList,
  productComparison,
  text,
  videoHero,
];
