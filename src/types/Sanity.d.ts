import type { SanityAssetDocument, SanityDocument } from 'next-sanity';

declare global {
  namespace Sanity {
    // Base Portable Text block (standard text blocks with marks and styles)
    interface PortableTextBlock {
      _type: 'block';
      _key: string;
      style?: 'normal' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'blockquote';
      children: Array<{
        _type: 'span';
        _key: string;
        text: string;
        marks?: string[];
      }>;
      markDefs?: Array<{
        _key: string;
        _type: string;
        [key: string]: unknown;
      }>;
      listItem?: 'bullet' | 'number';
      level?: number;
    }

    // Image block for portable text
    interface ImageBlock {
      _type: 'image';
      _key: string;
      asset: {
        _ref: string;
        _type: 'reference';
      };
      alt?: string;
      caption?: string;
      hotspot?: unknown;
      crop?: unknown;
    }

    // Social embed block for portable text
    interface SocialEmbedBlock {
      _type: 'socialEmbed';
      _key: string;
      platform: 'twitter' | 'linkedin' | 'instagram' | 'threads' | 'tiktok' | 'youtube';
      url: string;
    }

    // Code block for portable text
    interface CodeBlock {
      _type: 'code';
      _key: string;
      code?: string;
      language?: 'mermaid' | 'javascript' | 'typescript' | 'python' | 'bash' | string;
      filename?: string;
    }

    // Video block for portable text
    interface VideoBlock {
      _type: 'video';
      _key: string;
      [key: string]: unknown;
    }

    // Unknown block type (for extensibility)
    interface UnknownBlock {
      _type: string;
      _key: string;
      [key: string]: unknown;
    }

    // Portable Text block content - strongly typed union of all block types
    type BlockContent = Array<
      PortableTextBlock | ImageBlock | SocialEmbedBlock | CodeBlock | VideoBlock | UnknownBlock
    >;

    // Internationalized field types (sanity-plugin-internationalized-array)
    // Generic internationalized array structure
    type InternationalizedArray<T> = Array<{
      _key: string;
      value: T;
    }>;

    // Convenience types for common internationalized fields
    type InternationalizedArrayString = InternationalizedArray<string>;
    type InternationalizedArrayText = InternationalizedArray<string>;
    type InternationalizedArrayBlockContent = InternationalizedArray<BlockContent>;

    // documents

    interface Site extends SanityDocument {
      // branding
      title: InternationalizedArrayString;
      tagline?: InternationalizedArrayBlockContent;
      logo?: Logo;
      // info
      banners?: Banner[];
      copyright?: InternationalizedArrayBlockContent;
      ogimage?: string;
      // navigation
      ctas?: InternationalizedArray<CTA[]>;
      headerNav?: InternationalizedArray<(MenuItem | DropdownMenu)[]>;
      footerNav?: InternationalizedArray<(MenuItem | DropdownMenu)[]>;
      footerLinks?: InternationalizedArray<MenuItem[]>;
      systemStatus?: {
        title: string;
        url: string;
      };
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
      scope: 'collection.article' | 'page';
      location: 'top' | 'bottom' | 'sidebar' | 'injection';
      injectionConfig?: {
        afterParagraph?: number;
      };
      modules?: Module[];
    }

    interface ArticleCategory extends SanityDocument {
      readonly _type: 'article.category';
      title: string;
      description?: string;
      slug?: { current: string };
    }

    interface CollectionArticlePost extends SanityDocument {
      _type: 'collection.article';
      body: BlockContent;
      categories?: ArticleCategory[];
      authors?: Person[];
      publishDate: string;
      featured?: 'standard' | 'featured';
      metadata?: Metadata;
      seo?: {
        title?: string;
        description?: string;
        image?: Image;
        ogimage?: string;
        noIndex?: boolean;
      };
      collection?: {
        _id: string;
        metadata?: {
          slug?: { current: string };
          title?: string;
        };
      };
      readTime?: number;
      headings?: { style: string; text: string }[];
      translations?: Array<{
        _type: string;
        slug: string;
        collectionSlug: string;
        language: string;
      }>;
      language?: string;
    }

    interface CollectionNewsletter extends SanityDocument {
      _type: 'collection.newsletter';
      body: BlockContent;
      issueNumber?: number;
      preheader?: string;
      publishDate: string;
      featured?: 'standard' | 'featured';
      metadata?: Metadata;
      seo?: {
        title?: string;
        description?: string;
        image?: Image;
        ogimage?: string;
        noIndex?: boolean;
      };
      collection?: {
        _id: string;
        metadata?: {
          slug?: { current: string };
          title?: string;
        };
      };
      readTime?: number;
      headings?: { style: string; text: string }[];
      translations?: Array<{
        _type: string;
        slug: string;
        collectionSlug: string;
        language: string;
      }>;
      language?: string;
    }

    interface CollectionChangelogItem {
      _key: string;
      description: string;
      link?: string;
    }

    interface CollectionChangelogCategory {
      _key: string;
      category:
        | 'features'
        | 'improvements'
        | 'bugfixes'
        | 'security'
        | 'breaking'
        | 'docs'
        | 'deprecated';
      items?: CollectionChangelogItem[];
    }

    interface CollectionChangelog extends SanityDocument {
      _type: 'collection.changelog';
      version?: string;
      releaseType?: 'major' | 'minor' | 'patch' | 'beta' | 'alpha' | 'hotfix';
      publishDate: string;
      summary?: string;
      changes?: CollectionChangelogCategory[];
      featured?: 'standard' | 'featured';
      metadata?: Metadata;
      seo?: {
        title?: string;
        description?: string;
        noIndex?: boolean;
      };
      collection?: {
        _id: string;
        metadata?: {
          slug?: { current: string };
          title?: string;
        };
      };
      language?: string;
    }

    interface NewsletterFrontpage extends Module<'newsletter-frontpage'> {
      intro?: BlockContent;
      layout?: 'grid' | 'list' | 'carousel';
      columns?: 2 | 3 | 4;
      showFeaturedFirst?: boolean;
      limit?: number;
      showRssLink?: boolean;
    }

    interface ChangelogFrontpage extends Module<'changelog-frontpage'> {
      intro?: BlockContent;
      layout?: 'timeline' | 'cards' | 'compact';
      groupByYear?: boolean;
      showFeaturedFirst?: boolean;
      limit?: number;
      showRssLink?: boolean;
    }

    interface CollectionDocumentation extends SanityDocument {
      _type: 'collection.documentation';
      body: BlockContent;
      excerpt?: string;
      icon?: string;
      order?: number;
      parent?: {
        _id: string;
        metadata?: {
          slug?: { current: string };
          title?: string;
        };
      };
      relatedDocs?: CollectionDocumentation[];
      metadata?: Metadata;
      seo?: {
        title?: string;
        description?: string;
        image?: Image;
        ogimage?: string;
        noIndex?: boolean;
      };
      collection?: {
        _id: string;
        metadata?: {
          slug?: { current: string };
          title?: string;
        };
      };
      readTime?: number;
      headings?: { style: string; text: string }[];
      translations?: Array<{
        _type: string;
        slug: string;
        collectionSlug: string;
        language: string;
      }>;
      language?: string;
    }

    interface DocsCategory extends SanityDocument {
      readonly _type: 'docs.category';
      title: string;
      slug?: { current: string };
      description?: string;
      icon?: string;
      order: number;
    }

    interface DocsFrontpage extends Module<'docs-frontpage'> {
      intro?: BlockContent;
      layout?: 'sidebar' | 'cards' | 'categorized';
      categoryOrder?: Array<{ _ref: string }>;
      showUncategorized?: boolean;
      uncategorizedLabel?: string;
      uncategorizedPosition?: 'start' | 'end';
      sidebarStyle?: 'collapsible' | 'expanded' | 'flat';
      showCategoryDescriptions?: boolean;
      showCategoryIcons?: boolean;
      showSearch?: boolean;
      showTableOfContents?: boolean;
      showRelatedDocs?: boolean;
      defaultArticle?: CollectionDocumentation;
    }

    interface CollectionEvents extends SanityDocument {
      _type: 'collection.events';
      metadata: Metadata;
      eventType: 'webinar' | 'video' | 'physical' | 'hybrid';
      status: 'upcoming' | 'live' | 'completed' | 'cancelled';
      featured?: 'standard' | 'featured';
      startDateTime: string;
      endDateTime?: string;
      timezone?: string;
      location?: {
        venue?: string;
        address?: string;
        city?: string;
        country?: string;
        mapUrl?: string;
      };
      onlineLinks?: {
        registrationUrl?: string;
        liveUrl?: string;
        replayUrl?: string;
      };
      speakers?: Person[];
      body?: BlockContent;
      headings?: { style: string; text: string }[];
      seo?: {
        title?: string;
        description?: string;
        image?: Image;
        ogimage?: string;
        noIndex?: boolean;
      };
      collection?: {
        _id: string;
        metadata?: {
          slug?: { current: string };
          title?: string;
        };
      };
      translations?: Array<{
        _type: string;
        slug: string;
        collectionSlug: string;
        language: string;
      }>;
      language?: string;
    }

    interface EventsFrontpage extends Module<'events-frontpage'> {
      intro?: BlockContent;
      layout?: 'calendar' | 'cards' | 'list' | 'timeline';
      filterByType?: 'all' | 'webinar' | 'video' | 'physical' | 'hybrid';
      showUpcomingFirst?: boolean;
      showFeaturedFirst?: boolean;
      hidePastEvents?: boolean;
      limit?: number;
      showRssLink?: boolean;
    }

    // miscellaneous

    interface Banner extends SanityDocument {
      content: BlockContent;
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
      bio?: BlockContent;
      image?: Image;
      banner?: Image;
      socialLinks?: {
        _key: string;
        platform: string;
        url: string;
      }[];
    }

    interface Pricing extends SanityDocument {
      title: string;
      description?: string;
      highlight?: string;
      style?: 'default' | 'featured' | 'dark';
      price: {
        base?: string;
        yearly?: string;
        currency?: string;
        suffix?: string;
      };
      ctas?: CTA[];
      content?: BlockContent;
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
      icon?: string;
      ic0n?: string; // Legacy field name - keep for backwards compatibility
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
      asset?: Image['asset'];
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
      _key?: string;
      label: string;
      type: 'internal' | 'external';
      internal?: Page | CollectionArticlePost;
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
      spacing?: 'default' | 'compact' | 'relaxed' | 'none';
      width?: 'default' | 'narrow' | 'wide' | 'full';
      options?: {
        anchorId?: string;
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

    interface SanityReference<_T = unknown> {
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

    interface SocialEmbed {
      platform: 'twitter' | 'linkedin' | 'instagram' | 'threads' | 'tiktok' | 'youtube';
      url: string;
    }

    interface FormField {
      _key: string;
      label: string;
      name: { current: string };
      type: 'text' | 'email' | 'tel' | 'textarea' | 'checkbox';
      placeholder?: string;
      required?: boolean;
    }

    interface Form {
      intent: string;
      formTitle?: string;
      fields: FormField[];
      submitButtonText: string;
      successMessage?: BlockContent;
      acceptance?: {
        required: boolean;
        text: string;
        link?: {
          type: 'internal' | 'external';
          internal?: {
            _type: string;
            metadata?: { slug?: { current: string } };
          };
          external?: string;
          params?: string;
        };
      };
      redirect?: {
        type: 'internal' | 'external';
        internal?: {
          _type: string;
          metadata?: { slug?: { current: string } };
        };
        external?: string;
        params?: string;
      };
    }

    interface Contact extends Module<'contact'> {
      intro?: BlockContent;
      form: Form;
      officeInfo?: {
        title: string;
        address: {
          street: string;
          city: string;
          country: string;
        };
        email?: string;
        phone?: string;
        openingHours?: string;
      };
      contactPerson?: {
        title: string;
        name: string;
        position: string;
        description?: string;
        image?: Image;
        email?: string;
        phone?: string;
      };
    }

    interface LeadMagnet extends Module<'lead-magnet'> {
      content: BlockContent;
      buttonText: string;
      image?: Img;
      form: Form;
      style?: 'sidebar' | 'featured';
    }

    // Module Interfaces

    interface AccordionList extends Module<'accordion-list'> {
      content?: BlockContent;
      items?: {
        _key: string;
        summary: string;
        content: BlockContent;
        open?: boolean;
      }[];
    }

    interface Breadcrumbs extends Module<'breadcrumbs'> {
      crumbs?: MenuItem[];
      hideCurrent?: boolean;
      currentPage?: Page | CollectionArticlePost | ComponentLibrary;
    }

    interface Callout extends Module<'callout'> {
      content?: BlockContent;
      ctas?: CTA[];
    }

    interface ComponentGallery extends Module<'component-gallery'> {
      intro?: BlockContent;
      groups?: {
        _key: string;
        title: string;
        items?: Module[];
      }[];
    }

    interface Features extends Module<'features'> {
      intro?: BlockContent;
      items?: {
        _key: string;
        icon?: Icon;
        summary: string;
        content: BlockContent;
      }[];
    }

    interface Hero extends Module<'hero'> {
      highlightedTitle?: string;
      content?: BlockContent; // renamed from description to match schema
      ctas?: CTA[];
      image?: Img;
      videoType?: 'image' | 'mux' | 'youtube';
      muxVideo?: {
        asset?: {
          playbackId?: string;
        };
      };
      videoUrl?: string;
      options?: {
        anchorId?: string;
        bgFrom?: string;
        bgTo?: string;
      };
    }

    interface LatestArticles extends Module<'latest-articles'> {
      intro?: BlockContent;
      layout?: 'grid' | 'carousel';
      showFeaturedPostsFirst?: boolean;
      displayFilters?: boolean;
      limit?: number;
      filteredCategory?: ArticleCategory; // Resolved
    }

    interface ArticlesFrontpage extends Module<'articles-frontpage'> {
      showFeaturedFirst?: boolean;
      displayFilters?: boolean;
      limit?: number;
      showRssLink?: boolean;
    }

    interface LogoCloud extends Module<'logo-cloud'> {
      content?: BlockContent;
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
      intro?: BlockContent;
      tiers?: Pricing[]; // Resolved
    }

    interface ProductComparison extends Module<'product-comparison'> {
      intro?: BlockContent;
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
      intro?: BlockContent;
      people?: Person[]; // Resolved
      layout?: 'grid' | 'split';
    }

    interface Testimonials extends Module<'testimonials'> {
      intro?: BlockContent;
      reviews?: {
        _key: string;
        authorName: string;
        authorTitle?: string;
        authorImage?: Image;
        rating: number;
        reviewText: string;
        reviewDate?: string;
        embed?: SocialEmbed;
      }[];
    }

    interface Richtext extends Module<'richtext'> {
      content?: BlockContent;
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
