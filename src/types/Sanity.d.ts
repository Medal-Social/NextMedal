import type { SanityAssetDocument, SanityDocument } from 'next-sanity';

declare global {
  namespace Sanity {
    // color value type for reuse
    interface ColorValue {
      hex: string;
      alpha?: number;
      hsl?: {
        h: number;
        s: number;
        l: number;
        a?: number;
      };
      hsv?: {
        h: number;
        s: number;
        v: number;
        a?: number;
      };
      rgb?: {
        r: number;
        g: number;
        b: number;
        a?: number;
      };
    }

    interface ThemeColors {
      background?: ColorValue;
      foreground?: ColorValue;
      primary?: ColorValue;
      secondary?: ColorValue;
      accent?: ColorValue;
      muted?: ColorValue;
      destructive?: ColorValue;
      primaryForeground?: ColorValue;
      secondaryForeground?: ColorValue;
      accentForeground?: ColorValue;
      mutedForeground?: ColorValue;
      destructiveForeground?: ColorValue;
      border?: ColorValue;
      input?: ColorValue;
      ring?: ColorValue;
      chart1?: ColorValue;
      chart2?: ColorValue;
      chart3?: ColorValue;
      chart4?: ColorValue;
      chart5?: ColorValue;
      sidebarBackground?: ColorValue;
      sidebarForeground?: ColorValue;
      sidebarPrimary?: ColorValue;
      sidebarPrimaryForeground?: ColorValue;
      sidebarAccent?: ColorValue;
      sidebarAccentForeground?: ColorValue;
      sidebarBorder?: ColorValue;
      sidebarRing?: ColorValue;
      card?: ColorValue;
      cardForeground?: ColorValue;
      popover?: ColorValue;
      popoverForeground?: ColorValue;
    }

    // Stat interface for Hero stats component
    interface Stat {
      _key: string;
      value: string;
      label: string;
      icon?: Icon;
    }

    // documents

    interface Site extends SanityDocument {
      // branding
      title: string;
      tagline?: any;
      logo?: Logo;
      // info
      announcements?: Announcement[];
      copyright?: any;
      ogimage?: string;
      // navigation
      ctas?: CTA[];
      headerMenu?: Navigation;
      footerMenu?: Navigation;
      social?: Navigation;
      // theme
      themeSettings?: {
        defaultTheme?: 'light' | 'dark' | 'system';
        darkMode?: ThemeColors;
        lightMode?: ThemeColors;
      };
    }

    interface Navigation extends SanityDocument {
      title: string;
      items?: (Link | LinkList | LinkCategories)[];
    }

    // pages

    interface PageBase extends SanityDocument {
      _type: string;
      title?: string;
      parent?: Page[];
      metadata: Metadata;
    }

    interface Page extends PageBase {
      readonly _type: 'page';
      modules?: Module[];
    }

    interface GlobalModule extends SanityDocument {
      path: string;
      excludePaths?: string[];
      modules?: Module[];
    }

    interface BlogPost extends SanityDocument {
      _type: 'blog.post';
      body: any[];
      categories: SanityReference[];
      authors: SanityReference[];
      publishDate: string;
      featured?: boolean;
      hideTableOfContents?: boolean;
      metadata?: Metadata;
      relatedPosts?: SanityReference[];
    }

    interface BlogCategory extends SanityDocument {
      readonly _type: 'blog.category';
      title: string;
      description?: string;
      slug?: { current: string };
    }

    // miscellaneous

    interface Announcement extends SanityDocument {
      content: any;
      cta?: Link;
      start?: string;
      end?: string;
    }

    interface Logo extends SanityDocument {
      name: string;
      image?: Partial<{
        default: Image;
        light: Image;
        dark: Image;
      }>;
    }

    interface Person extends SanityDocument {
      name: string;
      title?: string;
      bio?: string;
      image?: Image;
      socialLinks?: {
        twitter?: string;
        linkedIn?: string;
        instagram?: string;
        youtube?: string;
      };
    }

    interface Pricing extends SanityDocument {
      title: string;
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
      text?: string;
      linkType?: 'internal' | 'external';
      internalLink?: SanityDocument;
      externalLink?: string;
      style?: string;
      size?: 'default' | 'sm' | 'lg';
      icon?: any;
      newTab?: boolean;
      params?: string;
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

    interface Image extends SanityAssetDocument {
      alt: string;
      loading: 'lazy' | 'eager';
    }

    interface Link {
      readonly _type: 'link';
      label: string;
      description?: string;
      icon?: Icon;
      type: 'internal' | 'external';
      internal?: Page | BlogPost | Changelog;
      external?: string;
      params?: string;
    }

    interface LinkList {
      readonly _type: 'link.list';
      link?: Link;
      links?: Link[];
    }

    interface LinkCategories {
      readonly _type: 'link.categories';
      title: string;
      categories: LinkCategory[];
    }

    interface LinkCategory {
      readonly _type: 'link.categories.list';
      title: string;
      links: Link[];
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
        hidden?: boolean;
        uid?: string;
      };
    }

    interface PricingComparisonTier {
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
      thumbnail: Sanity.Image;
      title: string;
    }

    export interface VideoHeroSanity {
      _type: 'videoHero';
      type: 'mux' | 'youtube';
      videoId: string;
      thumbnail: SanityImage;
      title: string;
    }

    interface VideoHero extends Module<'videoHero'> {
      type: 'mux' | 'youtube';
      videoId: string;
      thumbnail: SanityImage;
      title: string;
    }

    interface TabbedContent extends Module<'tabbedContent'> {
      content?: any[];
      pretitle?: string;
      tabs: Array<{
        _key: string;
        title: string;
        icon: {
          ic0n: string;
        };
        content: any[];
      }>;
      options?: ModuleOptions;
    }
    interface ModuleOptions {
      isFullWidth?: boolean;
    }
  }
}
export {};
