import AccordionList from './AccordionList';
import BlogFrontpage from './blog/BlogFrontpage';
import Breadcrumbs from './Breadcrumbs';
import Callout from './Callout';
import ComponentGallery from './ComponentGallery';
import Contact from './Contact';
import Features from './Features';
import Hero from './hero/Hero';
import LatestArticles from './blog/LatestArticles';
import LeadMagnet from './LeadMagnet';
import LogoCloud from './LogoCloud';
import PricingComparison from './PricingComparison';
import PricingList from './PricingList';
import ProductComparison from './ProductComparison';
import RichtextModule from './RichtextModule';
import Team from './Team';
import VideoHero from './VideoHero';
import type { ModuleContext, ModuleRegistry } from './registry';

export type { ModuleContext };

export const moduleRegistry: ModuleRegistry = {
  'accordion-list': { component: AccordionList },
  'blog-frontpage': { component: BlogFrontpage },
  'latest-articles': { component: LatestArticles },
  breadcrumbs: {
    component: Breadcrumbs,
    getProps: (module, { page, post }) => ({ ...module, currentPage: post || page }),
  },
  callout: { component: Callout },
  contact: { component: Contact },
  'component-gallery': { component: ComponentGallery },
  features: { component: Features },
  hero: { component: Hero },
  'lead-magnet': {
    component: LeadMagnet,
    getProps: (module, { isSidebar }) => ({
      ...module,
      style: isSidebar ? 'sidebar' : undefined,
    }),
  },
  leadMagnet: {
    component: LeadMagnet,
    getProps: (module, { isSidebar }) => ({
      ...module,
      style: isSidebar ? 'sidebar' : undefined,
    }),
  },
  leadmagnet: {
    component: LeadMagnet,
    getProps: (module, { isSidebar }) => ({
      ...module,
      style: isSidebar ? 'sidebar' : undefined,
    }),
  },
  'logo-cloud': { component: LogoCloud },
  team: { component: Team },
  'pricing-list': { component: PricingList },
  'pricing-comparison': { component: PricingComparison },
  'product-comparison': { component: ProductComparison },
  richtext: { component: RichtextModule },
  videoHero: {
    component: VideoHero,
    getProps: (module) => ({ data: module }),
  },
};
