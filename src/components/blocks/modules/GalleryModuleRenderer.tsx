'use client';

import { Suspense } from 'react';
import AccordionList from './content/AccordionList';
import Features from './content/Features';
import PricingComparison from './content/PricingComparison';
import PricingList from './content/PricingList';
import ProductComparison from './content/ProductComparison';
import RichtextModule from './content/RichtextModule';
import Team from './content/Team';
import Hero from './hero/Hero';
import VideoHero from './hero/VideoHero';
import Callout from './marketing/Callout';
import Contact from './marketing/Contact';
import LeadMagnet from './marketing/LeadMagnet';

function ModuleSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-64 bg-muted rounded-lg" />
    </div>
  );
}

/**
 * Placeholder for server-only components that cannot be rendered in client context
 */
function ServerOnlyPlaceholder({ moduleType }: { moduleType: string }) {
  return (
    <div className="flex items-center justify-center p-8 bg-muted/50 rounded-lg border border-dashed border-border">
      <p className="text-muted-foreground text-sm">
        <span className="font-medium">{moduleType}</span> requires server-side rendering and cannot
        be previewed in the gallery.
      </p>
    </div>
  );
}

interface Props {
  module: Sanity.Module;
}

/**
 * Simplified module renderer for ComponentGallery previews.
 * Does NOT include ComponentGallery itself to avoid circular dependencies.
 */
export function GalleryModuleRenderer({ module }: Props) {
  switch (module._type) {
    case 'accordion-list': {
      const props = module as Sanity.AccordionList;
      return <AccordionList {...props} />;
    }

    case 'breadcrumbs':
      return <ServerOnlyPlaceholder moduleType="Breadcrumbs" />;

    case 'callout': {
      const props = module as Sanity.Callout;
      return <Callout {...props} />;
    }

    case 'contact': {
      const props = module as Sanity.Contact;
      return (
        <Suspense fallback={<ModuleSkeleton />}>
          <Contact {...props} />
        </Suspense>
      );
    }

    case 'features': {
      const props = module as Sanity.Features;
      return <Features {...props} />;
    }

    case 'hero': {
      const props = module as Sanity.Hero;
      return <Hero {...props} />;
    }

    case 'latest-articles':
      return <ServerOnlyPlaceholder moduleType="Latest Articles" />;

    case 'lead-magnet':
    case 'leadMagnet':
    case 'leadmagnet': {
      const props = module as Sanity.LeadMagnet;
      return <LeadMagnet {...props} />;
    }

    case 'logo-cloud':
      return <ServerOnlyPlaceholder moduleType="Logo Cloud" />;

    case 'pricing-comparison': {
      const props = module as Sanity.PricingComparison;
      return <PricingComparison {...props} />;
    }

    case 'pricing-list': {
      const props = module as Sanity.PricingList;
      return (
        <Suspense fallback={<ModuleSkeleton />}>
          <PricingList {...props} />
        </Suspense>
      );
    }

    case 'product-comparison': {
      const props = module as Sanity.ProductComparison;
      return <ProductComparison {...props} />;
    }

    case 'richtext': {
      const props = module as Sanity.Richtext;
      return <RichtextModule {...props} />;
    }

    case 'team': {
      const props = module as Sanity.Team;
      return (
        <Suspense fallback={<ModuleSkeleton />}>
          <Team {...props} />
        </Suspense>
      );
    }

    case 'videoHero': {
      const props = module as Sanity.VideoHero;
      return <VideoHero data={props} />;
    }

    // ComponentGallery is intentionally NOT rendered here to avoid cycles
    case 'component-gallery':
      return <div data-type="component-gallery">(Gallery preview not available)</div>;

    default:
      return <div data-type={module._type} />;
  }
}
