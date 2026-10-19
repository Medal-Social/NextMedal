import { type ReactElement, Suspense } from 'react';
import AccordionList from './content/AccordionList';
import Features from './content/Features';
import FlipbookModule from './content/FlipbookModule';
import LogoCloud from './content/LogoCloud';
import PricingList from './content/PricingList';
import ProductComparison from './content/ProductComparison';
import RichtextModule from './content/RichtextModule';
import { ArticlesFrontpage } from './frontpage/articles';
import { ChangelogFrontpage } from './frontpage/changelog';
import { DocsFrontpage } from './frontpage/docs';
import { EventsFrontpage } from './frontpage/events';
import { NewsletterFrontpage } from './frontpage/newsletter';
import Hero from './hero/Hero';
import VideoHero from './hero/VideoHero';
import Callout from './marketing/Callout';
import LeadMagnet from './marketing/LeadMagnet';
import type { FilterParams, ModuleContext, SidebarProps } from './types';
import ComponentGallery from './utility/ComponentGallery';

function ModuleSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-64 rounded-lg bg-muted" />
    </div>
  );
}

interface Props {
  module: Sanity.Module;
  context: ModuleContext;
  sidebarProps: SidebarProps;
  searchParams?: FilterParams;
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
export function ModuleRenderer({
  module,
  context,
  sidebarProps,
  searchParams,
}: Props): ReactElement | null {
  const { page, isSidebar } = context;

  // Type assertions are needed because Sanity.Module._type is a generic string,
  // and TypeScript switch doesn't narrow to literal types automatically.
  switch (module._type) {
    case 'accordion-list': {
      const props = module as Sanity.AccordionList;
      return <AccordionList {...props} {...sidebarProps} />;
    }

    case 'articles-frontpage': {
      const props = module as Sanity.ArticlesFrontpage;
      return (
        <Suspense fallback={<ModuleSkeleton />}>
          <ArticlesFrontpage
            {...props}
            {...sidebarProps}
            locale={page?.language}
            searchParams={searchParams}
          />
        </Suspense>
      );
    }

    case 'newsletter-frontpage': {
      const props = module as Sanity.NewsletterFrontpage;
      return (
        <Suspense fallback={<ModuleSkeleton />}>
          <NewsletterFrontpage {...props} {...sidebarProps} locale={page?.language} />
        </Suspense>
      );
    }

    case 'changelog-frontpage': {
      const props = module as Sanity.ChangelogFrontpage;
      return (
        <Suspense fallback={<ModuleSkeleton />}>
          <ChangelogFrontpage {...props} {...sidebarProps} locale={page?.language} />
        </Suspense>
      );
    }

    case 'docs-frontpage': {
      const props = module as Sanity.DocsFrontpage;
      return (
        <Suspense fallback={<ModuleSkeleton />}>
          <DocsFrontpage {...props} {...sidebarProps} locale={page?.language} />
        </Suspense>
      );
    }

    case 'events-frontpage': {
      const props = module as Sanity.EventsFrontpage;
      return (
        <Suspense fallback={<ModuleSkeleton />}>
          <EventsFrontpage {...props} {...sidebarProps} locale={page?.language} />
        </Suspense>
      );
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

    case 'features': {
      const props = module as Sanity.Features;
      return <Features {...props} {...sidebarProps} />;
    }

    case 'hero': {
      const props = module as Sanity.Hero;
      return <Hero {...props} {...sidebarProps} />;
    }

    case 'lead-magnet':
    case 'leadMagnet':
    case 'leadmagnet': {
      const props = module as Sanity.LeadMagnet;
      return <LeadMagnet {...props} style={isSidebar ? 'sidebar' : undefined} {...sidebarProps} />;
    }

    case 'flipbook': {
      const props = module as Sanity.Flipbook;
      return <FlipbookModule {...props} {...sidebarProps} />;
    }

    case 'logo-cloud': {
      const props = module as Sanity.LogoCloud;
      return <LogoCloud {...props} {...sidebarProps} />;
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

    case 'videoHero': {
      const props = module as Sanity.VideoHero;
      return <VideoHero data={props} {...sidebarProps} />;
    }

    default:
      // Unknown module type - render empty placeholder for debugging
      return <div data-type={module._type} />;
  }
}
