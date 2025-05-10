import TabbedContentModule from '@/ui/modules/TabbedContentModule';
import AccordionList from './AccordionList';
import Breadcrumbs from './Breadcrumbs';
import Callout from './Callout';
import FeatureGrid from './FeatureGrid';
import FeaturedHero from './FeaturedHero';
import { HeroImageGallery } from './HeroImageGallery';
import Hero from './hero/Hero';
import LogoList from './LogoList';
import PersonList from './PersonList';
import PricingList from './PricingList';
import RichtextModule from './RichtextModule';
import VideoHero from './VideoHero';
import BlogFrontpage from './blog/BlogFrontpage';
import BlogList from './blog/BlogList';
import BlogPostContent from './blog/PostContent';

export default function Modules({
  modules,
  page,
  post,
  isTabbedModule = false,
}: {
  modules?: Sanity.Module[];
  page?: Sanity.Page;
  post?: Sanity.BlogPost;
  isTabbedModule?: boolean;
}) {
  return (
    <>
      {modules?.map((module) => {
        if (!module) return null;

        switch (module._type) {
          case 'accordion-list':
            return <AccordionList {...module} key={module._key} isTabbedModule={isTabbedModule} />;
          case 'blog-frontpage':
            return <BlogFrontpage {...module} key={module._key} isTabbedModule={isTabbedModule} />;
          case 'blog-list':
            return <BlogList {...module} key={module._key} isTabbedModule={isTabbedModule} />;
          case 'blog-post-content':
            return (
              <BlogPostContent
                {...module}
                post={post}
                key={module._key}
                isTabbedModule={isTabbedModule}
              />
            );
          case 'breadcrumbs':
            return (
              <Breadcrumbs
                {...module}
                currentPage={post || page}
                key={module._key}
                isTabbedModule={isTabbedModule}
              />
            );
          case 'callout':
            return <Callout {...module} key={module._key} isTabbedModule={isTabbedModule} />;

          case 'feature-grid':
            return <FeatureGrid {...module} key={module._key} isTabbedModule={isTabbedModule} />;
          case 'featuredHero':
            return <FeaturedHero {...module} key={module._key} isTabbedModule={isTabbedModule} />;
          case 'galleryHero':
            return <HeroImageGallery {...module} key={module._key} />;
          case 'hero':
            return <Hero {...(module as Sanity.Hero)} key={module._key} isTabbedModule={isTabbedModule} />;

          case 'logo-list':
            return <LogoList {...module} key={module._key} isTabbedModule={isTabbedModule} />;
          case 'person-list':
            return <PersonList {...module} key={module._key} isTabbedModule={isTabbedModule} />;
          case 'pricing-list':
            return <PricingList {...module} key={module._key} isTabbedModule={isTabbedModule} />;

          case 'richtext-module':
            return <RichtextModule {...module} key={module._key} isTabbedModule={isTabbedModule} />;

          case 'tabbedContent':
            return (
              <TabbedContentModule
                data={module as any}
                key={module._key}
                isTabbedModule={isTabbedModule}
              />
            );
          case 'videoHero':
            return (
              <VideoHero data={module as any} key={module._key} isTabbedModule={isTabbedModule} />
            );

          default:
            return <div data-type={module._type} key={module._key} />;
        }
      })}
    </>
  );
}
