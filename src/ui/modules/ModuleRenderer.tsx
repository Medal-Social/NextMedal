import { type ReactElement, Suspense } from 'react';
import AccordionList from './AccordionList';
import Breadcrumbs from './Breadcrumbs';
import BlogFrontpage from './blog/BlogFrontpage';
import LatestArticles from './blog/LatestArticles';
import Callout from './Callout';
import ComponentGallery from './ComponentGallery';
import Contact from './Contact';
import Features from './Features';
import Hero from './hero/Hero';
import LeadMagnet from './LeadMagnet';
import LogoCloud from './LogoCloud';
import PricingComparison from './PricingComparison';
import PricingList from './PricingList';
import ProductComparison from './ProductComparison';
import RichtextModule from './RichtextModule';
import Team from './Team';
import VideoHero from './VideoHero';

export interface ModuleContext {
  page?: Sanity.Page | Sanity.ComponentLibrary;
  post?: Sanity.BlogPost;
  isSidebar?: boolean;
}

function ModuleSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-64 bg-muted rounded-lg" />
    </div>
  );
}

type SidebarProps = {
  spacing?: 'default' | 'compact' | 'relaxed' | 'none';
  width?: 'default' | 'narrow' | 'wide' | 'full';
};

interface Props {
  module: Sanity.Module;
  context: ModuleContext;
  sidebarProps: SidebarProps;
}

/**
 * Static module renderer - uses switch for Cache Components compatibility.
 *
 * The switch statement is statically analyzable by the bundler, unlike the
 * previous registry object lookup which caused "Element type undefined" errors
 * during prerendering with cacheComponents enabled.
 *
 * TO ADD A NEW MODULE:
 * 1. Import it at the top of this file
 * 2. Add a case to the switch below
 * 3. Wrap in Suspense if it fetches data or is heavy
 */
export function ModuleRenderer({ module, context, sidebarProps }: Props): ReactElement | null {
  const { page, post, isSidebar } = context;

  // Type assertions are needed because Sanity.Module._type is a generic string,
  // and TypeScript switch doesn't narrow to literal types automatically.
  switch (module._type) {
    case 'accordion-list': {
      const props = module as Sanity.AccordionList;
      return <AccordionList {...props} {...sidebarProps} />;
    }

    case 'blog-frontpage': {
      const props = module as Sanity.BlogFrontpage;
      return (
        <Suspense fallback={<ModuleSkeleton />}>
          <BlogFrontpage {...props} {...sidebarProps} />
        </Suspense>
      );
    }

    case 'breadcrumbs': {
      const props = module as Sanity.Breadcrumbs;
      return <Breadcrumbs {...props} currentPage={post || page} {...sidebarProps} />;
    }

    case 'callout': {
      const props = module as Sanity.Callout;
      return <Callout {...props} {...sidebarProps} />;
    }

    case 'component-gallery': {
      const props = module as Sanity.ComponentGallery;
      return (
        <Suspense fallback={<ModuleSkeleton />}>
          <ComponentGallery {...props} {...sidebarProps} />
        </Suspense>
      );
    }

    case 'contact': {
      const props = module as Sanity.Contact;
      return (
        <Suspense fallback={<ModuleSkeleton />}>
          <Contact {...props} {...sidebarProps} />
        </Suspense>
      );
    }

    case 'features': {
      const props = module as Sanity.Features;
      return <Features {...props} {...sidebarProps} />;
    }

    case 'hero': {
      const props = module as Sanity.Hero;
      return <Hero {...props} {...sidebarProps} />;
    }

    case 'latest-articles': {
      const props = module as Sanity.LatestArticles;
      return (
        <Suspense fallback={<ModuleSkeleton />}>
          <LatestArticles {...props} {...sidebarProps} />
        </Suspense>
      );
    }

    case 'lead-magnet':
    case 'leadMagnet':
    case 'leadmagnet': {
      const props = module as Sanity.LeadMagnet;
      return <LeadMagnet {...props} style={isSidebar ? 'sidebar' : undefined} {...sidebarProps} />;
    }

    case 'logo-cloud': {
      const props = module as Sanity.LogoCloud;
      return <LogoCloud {...props} {...sidebarProps} />;
    }

    case 'pricing-comparison': {
      const props = module as Sanity.PricingComparison;
      return <PricingComparison {...props} {...sidebarProps} />;
    }

    case 'pricing-list': {
      const props = module as Sanity.PricingList;
      return (
        <Suspense fallback={<ModuleSkeleton />}>
          <PricingList {...props} {...sidebarProps} />
        </Suspense>
      );
    }

    case 'product-comparison': {
      const props = module as Sanity.ProductComparison;
      return <ProductComparison {...props} {...sidebarProps} />;
    }

    case 'richtext': {
      const props = module as Sanity.Richtext;
      return <RichtextModule {...props} {...sidebarProps} />;
    }

    case 'team': {
      const props = module as Sanity.Team;
      return (
        <Suspense fallback={<ModuleSkeleton />}>
          <Team {...props} {...sidebarProps} />
        </Suspense>
      );
    }

    case 'videoHero': {
      const props = module as Sanity.VideoHero;
      return <VideoHero data={props} {...sidebarProps} />;
    }

    default:
      // Unknown module type - render empty placeholder for debugging
      return <div data-type={module._type} />;
  }
}
