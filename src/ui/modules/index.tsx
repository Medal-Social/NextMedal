import AccordionList from './AccordionList';
import Breadcrumbs from './Breadcrumbs';
import BlogFrontpage from './blog/BlogFrontpage';
import LatestArticles from './blog/LatestArticles';
import Callout from './Callout';
import ComponentGallery from './ComponentGallery';
import Features from './Features';
import Hero from './hero/Hero';
import LogoCloud from './LogoCloud';
import Team from './Team';
import PricingList from './PricingList';
import ProductComparison from './ProductComparison';
import RichtextModule from './RichtextModule';
import VideoHero from './VideoHero';

export default function Modules({
  modules,
  page,
  post,
}: {
  modules?: Sanity.Module[];
  page?: Sanity.Page;
  post?: Sanity.BlogPost;
}) {
  return (
    <>
      {modules?.map((module) => {
        if (!module) return null;

        switch (module._type) {
          case 'component-gallery':
            return <ComponentGallery {...module} key={module._key} />;
          case 'accordion-list':
            return <AccordionList {...module} key={module._key} />;
          case 'blog-frontpage':
            return <BlogFrontpage {...module} key={module._key} />;
          case 'latest-articles':
            return <LatestArticles {...module} key={module._key} />;
          case 'breadcrumbs':
            return (
              <Breadcrumbs
                {...module}
                currentPage={post || page}
                key={module._key}
              />
            );
          case 'callout':
            return <Callout {...module} key={module._key} />;

          case 'features':
            return <Features {...module} key={module._key} />;
          case 'hero':
            return (
              <Hero
                {...(module as Sanity.Hero)}
                key={module._key}
              />
            );

          case 'logo-cloud':
            return <LogoCloud {...module} key={module._key} />;
          case 'team':
            return <Team {...module} key={module._key} />;
          case 'pricing-list':
            return <PricingList {...module} key={module._key} />;

          case 'product-comparison':
            return <ProductComparison {...module} key={module._key} />;

          case 'richtext':
            return <RichtextModule {...module} key={module._key} />;

          case 'videoHero':
            return (
              <VideoHero data={module as any} key={module._key} />
            );

          default:
            return <div data-type={module._type} key={module._key} />;
        }
      })}
    </>
  );
}
