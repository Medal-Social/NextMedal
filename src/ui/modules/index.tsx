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

type SidebarProps = {
  spacing?: 'default' | 'compact' | 'relaxed' | 'none';
  width?: 'default' | 'narrow' | 'wide' | 'full';
};

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

        const sidebarProps: SidebarProps = isSidebar ? { spacing: 'none', width: 'full' } : {};

        switch (module._type) {
          case 'accordion-list':
            return (
              <AccordionList
                {...(module as Sanity.AccordionList)}
                key={module._key}
                {...sidebarProps}
              />
            );
          case 'blog-frontpage':
            return (
              <BlogFrontpage
                {...(module as Sanity.BlogFrontpage)}
                key={module._key}
                {...sidebarProps}
              />
            );
          case 'latest-articles':
            return (
              <LatestArticles
                {...(module as Sanity.LatestArticles)}
                key={module._key}
                {...sidebarProps}
              />
            );
          case 'breadcrumbs':
            return (
              <Breadcrumbs
                {...(module as Sanity.Breadcrumbs)}
                currentPage={post || page}
                key={module._key}
                {...sidebarProps}
              />
            );
          case 'callout':
            return <Callout {...(module as Sanity.Callout)} key={module._key} {...sidebarProps} />;

          case 'contact':
            return <Contact {...(module as Sanity.Contact)} key={module._key} {...sidebarProps} />;

          case 'component-gallery':
            return (
              <ComponentGallery
                {...(module as Sanity.ComponentGallery)}
                key={module._key}
                {...sidebarProps}
              />
            );

          case 'features':
            return (
              <Features {...(module as Sanity.Features)} key={module._key} {...sidebarProps} />
            );
          case 'lead-magnet':
          case 'leadMagnet':
          case 'leadmagnet':
            return (
              <LeadMagnet
                {...(module as Sanity.LeadMagnet)}
                key={module._key}
                style={isSidebar ? 'sidebar' : undefined}
                {...sidebarProps}
              />
            );
          case 'hero':
            return <Hero {...(module as Sanity.Hero)} key={module._key} {...sidebarProps} />;

          case 'logo-cloud':
            return (
              <LogoCloud {...(module as Sanity.LogoCloud)} key={module._key} {...sidebarProps} />
            );
          case 'team':
            return <Team {...(module as Sanity.Team)} key={module._key} {...sidebarProps} />;
          case 'pricing-list':
            return (
              <PricingList
                {...(module as Sanity.PricingList)}
                key={module._key}
                {...sidebarProps}
              />
            );

          case 'pricing-comparison':
            return (
              <PricingComparison
                {...(module as Sanity.PricingComparison)}
                key={module._key}
                {...sidebarProps}
              />
            );

          case 'product-comparison':
            return (
              <ProductComparison
                {...(module as Sanity.ProductComparison)}
                key={module._key}
                {...sidebarProps}
              />
            );

          case 'richtext':
            return (
              <RichtextModule
                {...(module as Sanity.Richtext)}
                key={module._key}
                {...sidebarProps}
              />
            );

          case 'videoHero':
            return (
              <VideoHero data={module as Sanity.VideoHero} key={module._key} {...sidebarProps} />
            );

          default:
            return <div data-type={module._type} key={module._key} />;
        }
      })}
    </>
  );
}
