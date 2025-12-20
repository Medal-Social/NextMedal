import type { PortableTextBlock } from 'next-sanity';

// Helper to generate a random key
const key = () => crypto.randomUUID();

// Helper for basic text block
const pt = (text: string, style = 'normal', marks: string[] = []): PortableTextBlock => ({
  _type: 'block',
  style,
  _key: key(),
  children: [
    {
      _type: 'span',
      _key: key(),
      marks,
      text,
    },
  ],
});

// Helper for image
const image = (url: string, alt: string, w = 800, h = 600, caption?: string) => ({
  _type: 'image',
  _key: key(),
  src: url,
  alt,
  width: w,
  height: h,
  ...(caption && { caption }),
});

export const mockPost = {
  _id: 'example-post-full',
  _type: 'blog.post',
  metadata: {
    title: 'The Comprehensive Guide to Modern Web Development',
    slug: { current: 'example-post' },
    description:
      'A deep dive into Next.js 15, React Server Components, and the future of frontend architecture. This post demonstrates every available formatting option and module integration available in the Medal template.',
    image: image(
      'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=2000&q=80',
      'Coding setup',
      1200,
      600
    ),
  },
  publishDate: new Date().toISOString(),
  readTime: 15,
  categories: [
    { title: 'Development', slug: { current: 'dev' }, _id: 'cat1' },
    { title: 'Architecture', slug: { current: 'arch' }, _id: 'cat2' },
    { title: 'Design System', slug: { current: 'design' }, _id: 'cat3' },
  ],
  authors: [
    {
      _id: 'author1',
      name: 'Sarah Engineer',
      title: 'Principal Architect',
      image: image(
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
        'Sarah'
      ),
      socialLinks: [
        { _key: 'tw', platform: 'twitter', url: 'https://twitter.com' },
        { _key: 'gh', platform: 'github', url: 'https://github.com' },
      ],
    },
    {
      _id: 'author2',
      name: 'Alex Designer',
      title: 'Design Lead',
      image: image(
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
        'Alex'
      ),
      socialLinks: [{ _key: 'li', platform: 'linkedin', url: 'https://linkedin.com' }],
    },
  ],
  body: [
    {
      _type: 'block',
      style: 'normal',
      _key: key(),
      children: [
        {
          _type: 'span',
          _key: key(),
          text: 'Welcome to the future of web development. In this comprehensive guide, we will explore the intricacies of ',
        },
        {
          _type: 'span',
          _key: key(),
          marks: ['strong'],
          text: 'React Server Components (RSC)',
        },
        {
          _type: 'span',
          _key: key(),
          text: ', the power of ',
        },
        {
          _type: 'span',
          _key: key(),
          marks: ['em'],
          text: 'Next.js 15',
        },
        {
          _type: 'span',
          _key: key(),
          text: ', and how to build scalable, high-performance applications.',
        },
      ],
    },

    pt('1. The Shift to Server Components', 'h2'),

    {
      _type: 'block',
      style: 'normal',
      _key: key(),
      children: [
        {
          _type: 'span',
          _key: key(),
          text: 'React Server Components represent a paradigm shift in how we think about rendering. By moving the component graph execution to the server, we can reduce the client-side bundle size significantly. This leads to ',
        },
        {
          _type: 'span',
          _key: key(),
          marks: ['strong', 'em'],
          text: 'faster initial loads',
        },
        {
          _type: 'span',
          _key: key(),
          text: ' and improved Time to Interactive (TTI).',
        },
      ],
    },

    pt('Key Benefits', 'h3'),

    {
      _type: 'block',
      style: 'normal',
      listItem: 'bullet',
      level: 1,
      _key: key(),
      children: [
        {
          _type: 'span',
          _key: key(),
          text: "Zero bundle size for server components: They don't hydrate on the client.",
        },
      ],
    },
    {
      _type: 'block',
      style: 'normal',
      listItem: 'bullet',
      level: 1,
      _key: key(),
      children: [
        {
          _type: 'span',
          _key: key(),
          text: 'Direct access to backend resources: Query databases directly.',
        },
      ],
    },
    {
      _type: 'block',
      style: 'normal',
      listItem: 'bullet',
      level: 1,
      _key: key(),
      children: [
        {
          _type: 'span',
          _key: key(),
          text: 'Automatic code splitting: Next.js handles this automatically.',
        },
      ],
    },

    pt('Implementation Strategy', 'h3'),

    {
      _type: 'block',
      style: 'normal',
      listItem: 'number',
      level: 1,
      _key: key(),
      children: [
        {
          _type: 'span',
          _key: key(),
          text: 'Audit your existing codebase for client-side dependencies.',
        },
      ],
    },
    {
      _type: 'block',
      style: 'normal',
      listItem: 'number',
      level: 1,
      _key: key(),
      children: [
        {
          _type: 'span',
          _key: key(),
          text: 'Move global providers to a Client Component wrapper.',
        },
      ],
    },
    {
      _type: 'block',
      style: 'normal',
      listItem: 'number',
      level: 1,
      _key: key(),
      children: [
        {
          _type: 'span',
          _key: key(),
          text: 'Identify leaf nodes that require interactivity (useState, useEffect).',
        },
      ],
    },

    {
      _type: 'block',
      style: 'blockquote',
      _key: key(),
      children: [
        {
          _type: 'span',
          _key: key(),
          text: '"Server Components are the biggest change to React since Hooks. They allow us to build rich, interactive apps with the performance of static sites."',
        },
      ],
    },

    image(
      'https://images.unsplash.com/photo-1555099962-4199c345e5dd?auto=format&fit=crop&w=1600&q=80',
      'Code snippet on screen',
      1600,
      900,
      'Figure 1: A typical Server Component architecture.'
    ),

    pt('2. Advanced Formatting & Typography', 'h2'),

    {
      _type: 'block',
      style: 'normal',
      _key: key(),
      children: [
        {
          _type: 'span',
          _key: key(),
          text: 'We can handle various text styles beyond simple bold and italic. For example, inline code looks like this: ',
        },
        { _type: 'span', _key: key(), marks: ['code'], text: 'export default function Page() {}' },
        { _type: 'span', _key: key(), text: '. This is useful for technical documentation.' },
      ],
    },

    pt('Links and References', 'h3'),

    {
      _type: 'block',
      style: 'normal',
      _key: key(),
      children: [
        { _type: 'span', _key: key(), text: 'You can reference external resources like the ' },
        {
          _type: 'span',
          _key: key(),
          marks: ['link1'],
          text: 'official Next.js documentation',
        },
        { _type: 'span', _key: key(), text: ' or internal pages like our ' },
        {
          _type: 'span',
          _key: key(),
          marks: ['link2'],
          text: 'Component Library',
        },
        { _type: 'span', _key: key(), text: '.' },
      ],
      markDefs: [
        {
          _key: 'link1',
          _type: 'link',
          href: 'https://nextjs.org',
        },
        {
          _key: 'link2',
          _type: 'link',
          href: '/all-components',
        },
      ],
    },

    pt('3. Integrated Modules', 'h2'),
    pt(
      'One of the most powerful features of this CMS integration is the ability to embed full UI modules directly into the blog post flow. Below is a callout module, followed by a product comparison.',
      'normal'
    ),
  ],
  modules: [
    {
      _type: 'callout',
      _key: 'callout-blog-1',
      content: [
        {
          _type: 'block',
          style: 'h3',
          children: [{ _type: 'span', _key: key(), text: 'Subscribe to the Newsletter' }],
        },
        {
          _type: 'block',
          style: 'normal',
          children: [
            {
              _type: 'span',
              _key: key(),
              text: 'Get the latest updates directly to your inbox. No spam, just code.',
            },
          ],
        },
      ],
      ctas: [{ _type: 'cta', title: 'Subscribe Now', link: { _type: 'menuItem', external: '#' } }],
    },
    {
      _type: 'product-comparison',
      _key: 'comp-blog',
      pretitle: 'Comparison',
      intro: [pt('RSC vs Traditional SSR', 'h2')],
      products: [
        { name: 'Traditional SSR', highlight: false, _key: 'p1' },
        { name: 'React Server Components', highlight: true, _key: 'p2' },
      ],
      features: [
        {
          name: 'Bundle Size',
          featureDetails: ['Large (Hydration)', 'Zero (Server Only)'],
          _key: 'ft1',
        },
        { name: 'Data Fetching', featureDetails: ['API Routes', 'Direct DB Access'], _key: 'ft2' },
        { name: 'Interactivity', featureDetails: ['Full Page', 'Islands'], _key: 'ft3' },
      ],
    },
    {
      _type: 'accordion-list',
      _key: 'acc-blog',
      pretitle: 'Q&A',
      intro: [pt('Common Questions', 'h2')],
      items: [
        {
          _key: 'q1',
          summary: 'Can I use Client Components?',
          content: [
            pt(
              'Yes, you can import Client Components into Server Components using the "use client" directive.'
            ),
          ],
        },
        {
          _key: 'q2',
          summary: 'Is this SEO friendly?',
          content: [
            pt(
              'Extremely. The server renders the initial HTML, just like traditional SSR, ensuring search engines can crawl it perfectly.'
            ),
          ],
        },
      ],
    },
  ],
};
