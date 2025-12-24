import type { SanityAssetDocument, SanityDocument } from 'next-sanity';

declare global {
  namespace Sanity {
    // documents

    interface Site extends SanityDocument {
      // branding
      title: string;
      tagline?: any;
      logo?: Logo;
      // info
      banners?: Banner[];
      copyright?: any;
      ogimage?: string;
      // navigation
      ctas?: CTA[];
      headerMenu?: Navigation;
      footerMenu?: Navigation;
      footerLinks?: MenuItem[];
      systemStatus?: {
        title: string;
        url: string;
      };
      social?: Navigation;
      socialLinks?: {
        _key: string;
        text: string;
        url: string;
      }[];
      // custom
      brandPage?: string;
      enableSearch?: boolean;

      // cookie consent
      cookieConsent?: {
        enabled: boolean;
        privacyPolicy?: SanityReference<Page> | Page;
      };
    }

    interface Navigation extends SanityDocument {
      title: string;
      items?: (MenuItem | DropdownMenu)[];
    }

    // pages

    interface PageBase extends SanityDocument {
      _type: string;
      title?: string;
      parent?: Page[];
      metadata?: Metadata;
      language?: string;
      translations?: Array<{
        slug: string;
        language: string;
        _type: string;
      }>;
    }

    interface Page extends PageBase {
      readonly _type: 'page';
      modules?: Module[];
    }

    interface ComponentLibrary extends PageBase {
      readonly _type: 'component.library';
      modules?: Module[];
    }

    // interface GlobalModule extends SanityDocument {
    //   path: string;
    //   excludePaths?: string[];
    //   modules?: Module[];
    // }

    interface Placement extends SanityDocument {
      _type: 'placement';
      scope: 'blog.post' | 'page';
      location: 'top' | 'bottom' | 'sidebar' | 'injection';
      injectionConfig?: {
        afterParagraph?: number;
      };
      modules?: Module[];
    }

    interface BlogPost extends SanityDocument {
      _type: 'blog.post';
      body: any[];
      categories: BlogCategory[]; // Usually dereferenced in UI
      authors: Person[]; // Usually dereferenced in UI
      publishDate: string;
      featured?: boolean;
      metadata?: Metadata;
      relatedPosts?: BlogPost[]; // Usually dereferenced in UI
    }

    interface BlogCategory extends SanityDocument {
      readonly _type: 'blog.category';
      title: string;
      description?: string;
      slug?: { current: string };
    }

    // miscellaneous

    interface Banner extends SanityDocument {
      content: any;
      cta?: MenuItem;
      start?: string;
      end?: string;
    }

    interface Logo extends SanityDocument {
      name: string;
      title?: string;
      image?: Partial<{
        default: Image;
        light: Image;
        dark: Image;
      }>;
      link?: string;
    }

    interface Person extends SanityDocument {
      _key?: string; // added for list rendering
      name: string;
      title?: string;
      bio?: any;
      image?: Image;
      socialLinks?: {
        _key: string;
        platform: string;
        url: string;
      }[];
    }

    interface Pricing extends SanityDocument {
      title: string;
      description?: string; // added
      highlight?: string;
      price: {
        base?: string;
        yearly?: string;
        currency?: string;
        suffix?: string;
      };
      ctas?: CTA[];
      content?: any;
    }

    // objects

    interface CTA {
      readonly _type?: 'cta';
      _key?: string;
      link?: MenuItem;
      style?: 'primary' | 'ghost' | 'link';
    }

    interface Icon {
      readonly _type: 'icon';
      ic0n?: string;
    }

    interface Img {
      readonly _type: 'img';
      image: Image;
      responsive?: {
        image: Image;
        media: string;
      }[];
      alt?: string;
      loading?: 'lazy' | 'eager';
      asset?: any;
      url?: string;
    }

    interface Image extends Partial<SanityAssetDocument> {
      alt?: string;
      altText?: string;
      loading?: 'lazy' | 'eager';
      asset?: {
        _ref: string;
        _type: 'reference';
        altText?: string;
        url?: string; // added
      };
      url?: string; // added for direct access
    }

    interface MenuItem {
      readonly _type: 'menuItem';
      label: string;
      type: 'internal' | 'external';
      internal?: Page | BlogPost;
      external?: string;
      params?: string;
      newTab?: boolean;
    }

    type Link = MenuItem;

    interface DropdownMenu {
      readonly _type: 'dropdownMenu';
      title: string;
      links?: MenuItem[];
    }

    interface Metadata {
      slug: { current: string };
      title: string;
      description: string;
      image?: Image;
      ogimage?: string;
      noIndex: boolean;
    }

    interface Module<T = string> {
      _type: T;
      _key: string;
      options?: {
        uid?: string;
      };
    }

    interface PricingComparisonTier {
      _key: string;
      name: string;
      price: string;
      description: string;
      cta: CTA;
      popular: boolean;
    }

    interface SanityImage {
      _type: 'image';
      asset: {
        _ref: string;
        _type: 'reference';
      };
    }

    interface SanityReference<_T = any> {
      _type: 'reference';
      _ref: string;
      _weak?: boolean;
    }

    interface Video {
      type: 'mux' | 'youtube';
      videoId?: string;
      muxVideo?: {
        asset?: {
          playbackId?: string;
          data?: {
            playback_ids?: Array<{ id: string }>;
          };
        };
        playbackId?: string;
      };
      thumbnail?: Sanity.Image; // made optional
      title?: string;
    }

    // Module Interfaces

    interface AccordionList extends Module<'accordion-list'> {
      content?: any[];
      items?: {
        _key: string;
        summary: string;
        content: any[];
        open?: boolean;
      }[];
      generateSchema?: boolean;
    }

    interface BlogFrontpage extends Module<'blog-frontpage'> {
      mainPost?: 'recent' | 'featured';
      showFeaturedPostsFirst?: boolean;
      itemsPerPage?: number;
      posts?: BlogPost[]; // Extended for UI usage
    }

    interface Breadcrumbs extends Module<'breadcrumbs'> {
      crumbs?: MenuItem[];
      hideCurrent?: boolean;
      currentPage?: Page | BlogPost | ComponentLibrary;
    }

    interface Callout extends Module<'callout'> {
      content?: any[];
      ctas?: CTA[];
    }

    interface ComponentGallery extends Module<'component-gallery'> {
      intro?: any[];
      groups?: {
        _key: string;
        title: string;
        items?: Module[];
      }[];
    }

    interface Features extends Module<'features'> {
      intro?: any[];
      items?: {
        _key: string;
        icon?: Icon;
        summary: string;
        content: any[];
      }[];
    }

    interface Hero extends Module<'hero'> {
      highlightedTitle?: string;
      content?: any[]; // renamed from description to match schema
      ctas?: CTA[];
      image?: Img;
    }

    interface LatestArticles extends Module<'latest-articles'> {
      intro?: any[];
      layout?: 'grid' | 'carousel';
      showFeaturedPostsFirst?: boolean;
      displayFilters?: boolean;
      limit?: number;
      filteredCategory?: BlogCategory; // Resolved
    }

    interface LogoCloud extends Module<'logo-cloud'> {
      content?: any[];
      logos?: Logo[]; // Resolved
    }

    interface PricingComparison extends Module<'pricing-comparison'> {
      title?: string;
      description?: string;
      tiers?: PricingComparisonTier[];
      featureCategories?: {
        _key: string;
        category: string;
        items?: {
          _key: string;
          name: string;
          tooltip?: string;
          tiers?: (string | boolean)[];
          subItems?: {
            _key: string;
            name: string;
            tooltip?: string;
            tiers?: (string | boolean)[];
          }[];
        }[];
      }[];
    }

    interface PricingList extends Module<'pricing-list'> {
      intro?: any[];
      tiers?: Pricing[]; // Resolved
    }

    interface ProductComparison extends Module<'product-comparison'> {
      intro?: any[];
      products?: {
        _key: string;
        name: string;
        highlight?: boolean;
      }[];
      features?: {
        _key: string;
        name: string;
        featureDetails?: string[];
      }[];
    }

    interface Team extends Module<'team'> {
      intro?: any[];
      people?: Person[]; // Resolved
      layout?: 'grid' | 'split';
    }

    interface Richtext extends Module<'richtext'> {
      content?: any[];
    }

    interface VideoHero extends Module<'videoHero'> {
      type: 'mux' | 'youtube';
      videoId?: string;
      muxVideo?: {
        asset?: {
          playbackId?: string;
        };
        playbackId?: string; // added
      };
      thumbnail?: Image;
      title?: string;
    }
  }
}
