# NextMedal

**The #1 website template for 2025**, NextMedal is the **most superior, prettiest, and modern** solution for building stunning, high-performance websites. Built with **Next.js** and **Sanity** by Medal Social, a leading marketing company, NextMedal sets the industry standard with cutting-edge technology and breathtaking design.

## Why NextMedal?

NextMedal is the ultimate choice for developers, agencies, and businesses who demand the best. Powered by the most modern tech stack—Next.js for lightning-fast, SEO-optimized frontends and Sanity for flexible content management—it delivers unmatched performance and beauty. Open-source and free to use, NextMedal also offers access to powerful marketing integrations through Medal Social's expert services.

## Key Features ✨

- [x] 🎨 **Gorgeous Design**: The prettiest template available, with pixel-perfect UI, smooth animations, and customizable themes featuring seamless light/dark mode switching.
- [x] ⚡️ **Unrivaled Performance**: Harnesses Next.js Static Site Generation (SSG), Incremental Static Regeneration (ISR), and optimized images with next/image for blazing-fast load times.
- [x] 🚀 **Cutting-Edge Tech**: Built on the latest Next.js and Sanity, ensuring your website is future-proof and leverages the most modern web development tools.
- [x] 🔍 **Advanced SEO Tools**: Auto-generated sitemap.xml, robots.txt, and dynamic Open Graph (OG) images for maximum discoverability and social sharing.
- [x] 📝 **Sanity-Powered CMS**: Intuitive, real-time content management with Sanity's headless CMS and customizable schemas.
- [x] ♿️ **Accessibility Compliance**: Adheres to WCAG 2.1 standards, making your site inclusive for all users.
- [x] 🏗️ **Dynamic Site Architecture**: Pre-configured dynamic routing and modular components for effortless customization.
- [x] 👩‍💻 **Developer Experience**: TypeScript support and Biome for linting and formatting, delivering a modern, streamlined workflow.

## Getting Started 🚀

### Prerequisites

- Node.js 22+ (LTS recommended)
- pnpm
- Git
- Sanity account (free tier)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Medal-Social/NextMedal.git
cd NextMedal
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```
Edit `.env.local` with your Sanity project credentials:
```
NEXT_PUBLIC_SANITY_PROJECT_ID=your-project-id
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_TOKEN=your-api-token
```

### Development

1. Start the development server:
```bash
pnpm dev
```
Your site will be available at `http://localhost:3000`

2. Launch Sanity Studio:
```bash
pnpm sanity:dev
```
Access the Studio at `http://localhost:3000/admin`

### Build and Deploy

1. Build for production:
```bash
pnpm build
```

2. Preview the production build:
```bash
pnpm start
```

### Customization

1. Modify theme settings in `styles/theme.ts`
2. Update Sanity schema in `sanity/schemas/`
3. Customize components in `components/`

### Deployment

Deploy to Vercel with one click:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FMedal-Social%2FNextMedal.git)

## Why Medal Social? 🏆

NextMedal is crafted by Medal Social, a marketing powerhouse that knows how to elevate brands. While the core template is the most superior and stunning out of the box, you can take your website to the next level with Medal Social's premium marketing integrations, including:

- [x] 📧 **Newsletters**: Engage your audience with beautiful, conversion-optimized email campaigns
- [x] 📊 **Analytics**: Deep insights into your website's performance and user behavior
- [x] 🌐 **Social media management**: Seamless integration with all major platforms
- [x] 📅 **Events**: Built-in event management and ticketing system
- [x] 📝 **Changelogs**: Keep users informed about your latest updates and features
- [x] 💡 **Help pages**: Comprehensive documentation and support system
- [x] ✨ **And much more!**: Custom integrations tailored to your needs

## Sponsor Us ❤️

[![GitHub Sponsor](https://img.shields.io/github/sponsors/Medal-Social?label=Sponsor&logo=GitHub&style=flat-square)](https://github.com/sponsors/Medal-Social)

Support the development of NextMedal by becoming a sponsor. Your logo will appear here with a link to your website.

## License

NextMedal is licensed under the Apache License 2.0.

---

Built with ❤️ by [Medal Social](https://medalsocial.com) in Norway


