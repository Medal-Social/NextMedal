import { type ReactElement, Suspense } from 'react';
import AccordionList from './content/AccordionList';
import Features from './content/Features';
import LogoCloud from './content/LogoCloud';
import PricingComparison from './content/PricingComparison';
import PricingList from './content/PricingList';
import ProductComparison from './content/ProductComparison';
import RichtextModule from './content/RichtextModule';
import Team from './content/Team';
import { ArticlesFrontpage } from './frontpage/articles';
import { ChangelogFrontpage } from './frontpage/changelog';
import { DocsFrontpage } from './frontpage/docs';
import { EventsFrontpage } from './frontpage/events';
import { NewsletterFrontpage } from './frontpage/newsletter';
import Hero from './hero/Hero';
import VideoHero from './hero/VideoHero';
import Callout from './marketing/Callout';
import Contact from './marketing/Contact';
import LeadMagnet from './marketing/LeadMagnet';
import type { FilterParams, ModuleContext, SidebarProps } from './types';
import Breadcrumbs from './utility/Breadcrumbs';
import ComponentGallery from './utility/ComponentGallery';
import LatestArticles from './utility/LatestArticles';

function ModuleSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-64 bg-muted rounded-lg" />
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
  const { page, post, isSidebar } = context;

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
