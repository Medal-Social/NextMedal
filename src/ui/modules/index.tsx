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

export default function Modules({
  modules,
  page,
  post,
  isSidebar = false,
}: {
  modules?: Sanity.Module[];
  page?: Sanity.Page | Sanity.ComponentLibrary;
  post?: Sanity.BlogPost;
  isSidebar?: boolean;
}) {
  if (!modules?.length) {
    return null;
  }

  return (
    <>
      {modules?.map((module) => {
        if (!module) return null;

        const sidebarProps = isSidebar ? { spacing: 'none', width: 'full' } : {};

        switch (module._type) {
          case 'accordion-list':
            return (
              <AccordionList
                {...(module as Sanity.AccordionList)}
                key={module._key}
                {...(sidebarProps as any)}
              />
            );
          case 'blog-frontpage':
            return (
              <BlogFrontpage
                {...(module as Sanity.BlogFrontpage)}
                key={module._key}
                {...(sidebarProps as any)}
              />
            );
          case 'latest-articles':
            return (
              <LatestArticles
                {...(module as Sanity.LatestArticles)}
                key={module._key}
                {...(sidebarProps as any)}
              />
            );
          case 'breadcrumbs':
            return (
              <Breadcrumbs
                {...(module as Sanity.Breadcrumbs)}
                currentPage={post || page}
                key={module._key}
                {...(sidebarProps as any)}
              />
            );
          case 'callout':
            return (
              <Callout
                {...(module as Sanity.Callout)}
                key={module._key}
                {...(sidebarProps as any)}
              />
            );

          case 'contact':
            return <Contact {...(module as any)} key={module._key} {...(sidebarProps as any)} />;

          case 'component-gallery':
            return (
              <ComponentGallery
                {...(module as Sanity.ComponentGallery)}
                key={module._key}
                {...(sidebarProps as any)}
              />
            );

          case 'features':
            return (
              <Features
                {...(module as Sanity.Features)}
                key={module._key}
                {...(sidebarProps as any)}
              />
            );
          case 'lead-magnet':
          case 'leadMagnet':
          case 'leadmagnet':
            return (
              <LeadMagnet
                {...(module as any)}
                key={module._key}
                style={isSidebar ? 'sidebar' : undefined}
                {...(sidebarProps as any)}
              />
            );
          case 'hero':
            return (
              <Hero {...(module as Sanity.Hero)} key={module._key} {...(sidebarProps as any)} />
            );

          case 'logo-cloud':
            return (
              <LogoCloud
                {...(module as Sanity.LogoCloud)}
                key={module._key}
                {...(sidebarProps as any)}
              />
            );
          case 'team':
            return (
              <Team {...(module as Sanity.Team)} key={module._key} {...(sidebarProps as any)} />
            );
          case 'pricing-list':
            return (
              <PricingList
                {...(module as Sanity.PricingList)}
                key={module._key}
                {...(sidebarProps as any)}
              />
            );

          case 'pricing-comparison':
            return (
              <PricingComparison
                {...(module as Sanity.PricingComparison)}
                key={module._key}
                {...(sidebarProps as any)}
              />
            );

          case 'product-comparison':
            return (
              <ProductComparison
                {...(module as Sanity.ProductComparison)}
                key={module._key}
                {...(sidebarProps as any)}
              />
            );

          case 'richtext':
            return (
              <RichtextModule
                {...(module as Sanity.Richtext)}
                key={module._key}
                {...(sidebarProps as any)}
              />
            );

          case 'videoHero':
            return <VideoHero data={module as any} key={module._key} {...(sidebarProps as any)} />;

          default:
            return <div data-type={module._type} key={module._key} />;
        }
      })}
    </>
  );
}
