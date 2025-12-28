/**
 * Sanity Schema Index
 * @version 1.0.1
 * @lastUpdated 2025-12-23
 * @description Central registry where all document, object, module, and fragment schemas are exported.
 * @changelog
 * - 1.0.1: Added header documentation
 * - 1.0.0: Initial version
 */

import type { SchemaTypeDefinition } from 'sanity';

// documents
import blogCategory from './documents/blog.category';
import blogPost from './documents/blog.post';
import componentLibrary from './documents/component-library';
import form from './documents/form';
import navigation from './documents/navigation';
import page from './documents/page';
import placement from './documents/placement';
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
import breadcrumbs from './modules/breadcrumbs';
import callout from './modules/callout';
import componentGallery from './modules/component-gallery';
import contact from './modules/contact';
import features from './modules/features';
import hero from './modules/hero';
import latestArticles from './modules/latest-articles';
import leadMagnet from './modules/lead-magnet';
import logoCloud from './modules/logo-cloud';
import pricingComparison from './modules/pricing-comparison';
import pricingList from './modules/pricing-list';
import productComparison from './modules/product-comparison';
import team from './modules/team';
import text from './modules/text';
import videoHero from './modules/video-hero';
import cta from './objects/cta';
import dropdownMenu from './objects/dropdown-menu';
import icon from './objects/icon';
import img from './objects/img';
import link from './objects/link';
import menuItem from './objects/menu-item';
import metadata from './objects/metadata';
import moduleOptions from './objects/module-options';
import video from './objects/video';

export const schemaTypes: SchemaTypeDefinition[] = [
  // documents
  blogCategory,
  blogPost,
  componentLibrary,
  form,
  placement,
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
  link,
  menuItem,
  dropdownMenu,
  metadata,
  moduleOptions,
  video,
  modules,

  // modules
  accordionList,
  blogFrontpage,
  latestArticles,
  leadMagnet,
  breadcrumbs,
  callout,
  componentGallery,
  features,
  contact,
  hero,
  logoCloud,

  team,
  pricingComparison,
  pricingList,
  productComparison,
  text,
  videoHero,
];
