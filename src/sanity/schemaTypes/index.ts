/**
 * Sanity Schema Index
 * @version 2.0.0
 * @lastUpdated 2025-12-31
 * @description Central registry where all document, object, module, and fragment schemas are exported.
 * @changelog
 * - 2.0.0: Reorganized schema structure to match Sanity Studio (shared/, modules/*)
 * - 1.2.0: Renamed listing modules to frontpage (articles-frontpage, changelog-frontpage, etc.)
 * - 1.1.0: Added collections system (collection.article, articles-frontpage module)
 * - 1.0.1: Added header documentation
 * - 1.0.0: Initial version
 */

import type { SchemaTypeDefinition } from 'sanity';
// Documents - Collections
import collectionArticle from './documents/collections/article';
import collectionChangelog from './documents/collections/changelog';
import collectionDocumentation from './documents/collections/documentation';
import collectionEvents from './documents/collections/events';
import lead from './documents/collections/lead';
import collectionNewsletter from './documents/collections/newsletter';
import componentLibrary from './documents/component-library';
// Documents - Pages
import page from './documents/page';
import articleCategory from './documents/shared/article.category';
// Documents - Shared Content
import banner from './documents/shared/banner';
import docsCategory from './documents/shared/docs.category';
import form from './documents/shared/form';
import logo from './documents/shared/logo';
import person from './documents/shared/person';
import placement from './documents/shared/placement';
import pricing from './documents/shared/pricing';
import redirect from './documents/shared/redirect';
import site from './documents/site';
// Fragments
import modules from './fragments/modules';
// Modules - Content Sections
import accordionList from './modules/content/accordion-list';
import features from './modules/content/features';
import logoCloud from './modules/content/logo-cloud';
import pricingComparison from './modules/content/pricing-comparison';
import pricingList from './modules/content/pricing-list';
import productComparison from './modules/content/product-comparison';
import team from './modules/content/team';
import text from './modules/content/text';
// Modules - Frontpages
import articlesFrontpage from './modules/frontpage/articles-frontpage';
import changelogFrontpage from './modules/frontpage/changelog-frontpage';
import docsFrontpage from './modules/frontpage/docs-frontpage';
import eventsFrontpage from './modules/frontpage/events-frontpage';
import newsletterFrontpage from './modules/frontpage/newsletter-frontpage';
// Modules - Hero Sections
import hero from './modules/hero/hero';
import videoHero from './modules/hero/video-hero';
// Modules - Marketing & Leads
import callout from './modules/marketing/callout';
import contact from './modules/marketing/contact';
import leadMagnet from './modules/marketing/lead-magnet';
// Modules - Utility
import breadcrumbs from './modules/utility/breadcrumbs';
import componentGallery from './modules/utility/component-gallery';
import latestArticles from './modules/utility/latest-articles';
// Objects
import cta from './objects/cta';
import dropdownMenu from './objects/dropdown-menu';
import icon from './objects/icon';
import img from './objects/img';
import link from './objects/link';
import menuItem from './objects/menu-item';
import metadata from './objects/metadata';
import moduleOptions from './objects/module-options';
import seoMetadata from './objects/seo-metadata';
import socialEmbed from './objects/social-embed';
import video from './objects/video';

export const schemaTypes: SchemaTypeDefinition[] = [
  // Documents - Pages
  page,
  site,
  componentLibrary,

  // Documents - Collections
  collectionArticle,
  collectionChangelog,
  collectionDocumentation,
  collectionEvents,
  collectionNewsletter,
  lead,

  // Documents - Shared Content
  banner,
  articleCategory,
  docsCategory,
  form,
  logo,
  person,
  placement,
  pricing,
  redirect,

  // Objects
  cta,
  dropdownMenu,
  icon,
  img,
  link,
  menuItem,
  metadata,
  moduleOptions,
  seoMetadata,
  socialEmbed,
  video,
  modules,

  // Modules - Hero Sections
  hero,
  videoHero,

  // Modules - Content Sections
  accordionList,
  features,
  logoCloud,
  pricingComparison,
  pricingList,
  productComparison,
  team,
  text,

  // Modules - Marketing & Leads
  callout,
  contact,
  leadMagnet,

  // Modules - Frontpages
  articlesFrontpage,
  changelogFrontpage,
  docsFrontpage,
  eventsFrontpage,
  newsletterFrontpage,

  // Modules - Utility
  breadcrumbs,
  componentGallery,
  latestArticles,
];
