# NextMedal
[![Powered by Medal Social](public/powered-by-medal-social-large.svg)](https://medalsocial.com)


**The #1 website template for 2026**, NextMedal is the **most superior, prettiest, and modern** solution for building stunning, high-performance websites. Built and maintained with **Next.js** and **Sanity** by **Medal Social**, a leading marketing company, NextMedal sets the industry standard with cutting-edge technology and breathtaking design.

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

## Tech Stack 🛠️

### Core Tech
- **Next.js 16**: Latest App Router, Server Components, Turbopack
- **React 19**: Bleeding edge React features
- **TypeScript**: End-to-end type safety
- **Tailwind CSS 4**: Modern utility-first styling

### Content & Media
- **Sanity CMS**: Visual editing, real-time collaboration
- **Mux Video**: High-performance video streaming
- **Next-Intl**: Built-in internationalization
- **Portable Text**: Structured content format

### UI & UX
- **Framer Motion**: Production-ready animations
- **Base UI**: Accessible unstyled primitives
- **Dark Mode**: System-aware theme switching
- **Responsive**: Mobile-first design

### Quality & DX
- **Biome**: Fast linting and formatting with strict accessibility rules
- **Husky**: Pre-commit hooks for quality assurance
- **Vitest**: Unit and integration testing
- **SEO Ready**: Dynamic sitemaps, OG images
- **Accessibility**: WCAG 2.1 compliant (enforced by linter)

## Getting Started 🚀

> **New to NextMedal?** Check out [QUICKSTART.md](./QUICKSTART.md) for a complete beginner's guide!

### Critical Requirements

⚠️ **This project requires:**
- **Node.js 24 or later** (Next.js 16 + React 19 requirement)
- **pnpm package manager** (NOT npm or yarn)

```bash
# Check your versions:
node --version   # Should be v24.x.x or higher
pnpm --version   # Should be 10.x.x or higher
```

**Don't have these?** See [QUICKSTART.md](./QUICKSTART.md#️-critical-requirements-read-first) for installation instructions.

---

### Quick Setup (3 Steps)

#### 1. Clone & Install

```bash
git clone https://github.com/Medal-Social/NextMedal.git
cd NextMedal
pnpm install
```

#### 2. Configure Environment

```bash
# Copy the example environment file
cp .env.example .env.local

# Edit .env.local and set these REQUIRED variables:
# NEXT_PUBLIC_SANITY_PROJECT_ID=your-project-id-here
# NEXT_PUBLIC_SANITY_DATASET=production
# NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

**Get your Sanity Project ID:**
1. Go to [sanity.io/manage](https://www.sanity.io/manage)
2. Create a new project or use an existing one
3. Copy the Project ID
4. **Configure CORS** (Important for new projects!):
   - Go to API → CORS Origins
   - Add `http://localhost:3000` with "Allow credentials" checked
   - This lets you access the Studio at `/studio`

**Validate your setup:**
```bash
pnpm setup:check
```

#### 3. Start Development

```bash
# Start the dev server
pnpm dev
```

**Access your site:**
- **Frontend:** http://localhost:3000
- **Sanity Studio:** http://localhost:3000/studio (schemas auto-deploy on first access)

---

### Creating Your First Page

1. Open http://localhost:3000/studio
2. Click **Create** → **Page**
3. Set **slug** to `index`
4. Add content and **Publish**
5. Visit http://localhost:3000 to see your homepage!

---

### Available Commands

```bash
# Development
pnpm dev                    # Start dev server (http://localhost:3000)
pnpm setup:check            # Validate environment setup

# Code Quality
pnpm lint                   # Run Biome linting
pnpm format                 # Auto-format with Biome
pnpm typecheck              # TypeScript type checking

# Testing
pnpm test                   # Run all tests
pnpm test:watch             # Run tests in watch mode
pnpm e2e                    # Run E2E tests
pnpm e2e:smoke              # Quick smoke tests

# Production
pnpm build                  # Production build
pnpm start                  # Run production build
```

See [CLAUDE.md](./CLAUDE.md) for the complete command reference.

---

### Project Structure

```
NextMedal/
├── src/
│   ├── app/                      # Next.js 16 App Router
│   │   ├── (frontend)/           # Main site routes (with [locale])
│   │   └── (studio)/             # Sanity Studio at /studio
│   ├── ui/                       # Page-level UI components
│   ├── components/ui/            # Reusable base components
│   ├── sanity/schemaTypes/       # Sanity schema definitions
│   └── lib/                      # Core utilities
└── tests/                        # All tests (Vitest + Playwright)
```

---

### Customization

- **Content schemas:** `src/sanity/schemaTypes/`
- **UI components:** `src/ui/` and `src/components/ui/`
- **Page routes:** `src/app/(frontend)/[locale]/`
- **Styling:** Tailwind CSS (edit classes directly in components)

---

## Troubleshooting 🔧

### Common Issues

#### "This project requires Node.js 24 or higher"

You're using an older Node version. Upgrade to Node 24+:
```bash
# Using nvm (recommended)
nvm install 24
nvm use 24

# Or download from nodejs.org (choose "Current")
```

#### "This project requires pnpm" or similar error

You tried to use npm or yarn. Install and use pnpm instead:
```bash
npm install -g pnpm
rm -rf node_modules
pnpm install
```

#### Blank page at http://localhost:3000

No index page exists in Sanity. Create one:
1. Go to http://localhost:3000/studio
2. Create a Page document with slug = "index"
3. Publish it
4. Refresh your site

#### "Invalid environment variables"

Missing required env vars. Run the validator:
```bash
pnpm setup:check
```
Fix any failed checks shown in the output.

#### Port 3000 already in use

Another app is using port 3000:
```bash
# Kill the other process
lsof -ti:3000 | xargs kill

# Or use a different port
PORT=3001 pnpm dev
```

#### Studio blocked by CORS or won't load

Configure CORS in your Sanity project:
1. Go to [sanity.io/manage](https://www.sanity.io/manage) → Your Project
2. Navigate to **API** → **CORS Origins**
3. Add `http://localhost:3000` with "Allow credentials" checked
4. Save and refresh the Studio

**More help?** See [QUICKSTART.md](./QUICKSTART.md#troubleshooting) for detailed troubleshooting.

---

## Language Switcher Refactor Plan

### Current Findings (What's Broken)

- Translation detection is inconsistent across page types, especially for collection items and the homepage.
- The "translation exists" signal is not unified between Sanity page links (manual relationships) and collection translation metadata (generated/derived).
- URL construction for translated collection items is not always aligned with collection slugs, which can cause false "translation missing" results.
- Homepage translations are often not linked in Sanity metadata, so the switcher lacks reliable translation data even when a localized homepage exists.
- Fallback behavior (dialog) works, but it is triggered too often due to incomplete translation lookup.

### Refactor Goals

- Guarantee auto-switch to a translated page when a translation exists.
- Preserve the dialog fallback only when a translation truly does not exist.
- Use a single, well-defined translation lookup contract for pages, collections, and homepage.
- Ensure URL generation is consistent with collection slugs for all locales.

### Investigation Plan

1. Map the current language switcher flow (data sources, lookups, URL building).
2. Define a unified translation contract: input page type + locale -> translation URL or "missing".
3. Identify where translation data lives for:
   - Standard pages (Sanity translation metadata links).
   - Collection items (generated translation metadata).
   - Homepage (index pages per locale).
4. Determine required data additions or fallbacks to avoid false negatives.
5. Validate logic against real content scenarios (index, collection item, standard page).

### Test Plan (Unit + Integration)

Unit tests:

- `buildTranslationUrls` returns correct URLs for:
  - Home page with translations.
  - Standard page (about, contact).
  - Collection item (articles/docs/newsletter/events).
- Missing translation triggers "missing" result (no URL).
- Default locale prefix handling is correct.

Integration tests:

- Homepage: switching to a translated homepage auto-navigates.
- Collection item: switching to a translated item auto-navigates with correct collection slug.
- Standard page: switching to a translated page auto-navigates.
- Missing translation: opens dialog and does not navigate.

### Proposed Fixes (High-Level)

- Normalize translation discovery into a single server-side function that returns a map of locale -> URL.
- For homepage, detect localized index pages even without translation metadata links.
- For collections, resolve collection slugs from the registry before building URLs.
- Ensure the language switcher uses this unified map (no per-type branching in the client).

### Deployment

NextMedal is configured for `output: "standalone"`, making it compatible with Vercel, Coolify, and any Docker-based deployment.

#### Sentry Error Monitoring

NextMedal includes built-in support for [Sentry](https://sentry.io/). Monitoring is **completely optional** and only active if configured.

To enable Sentry:
1. Set `NEXT_PUBLIC_SENTRY_DSN` in your environment variables.
2. Set `SENTRY_ORG` and `SENTRY_PROJECT` to match your Sentry project configuration.
3. (Optional) Set `SENTRY_AUTH_TOKEN` during build-time to upload source maps for better stack traces.

The integration utilizes the latest Next.js 16+ patterns, including `instrumentation.ts` for deep server-side error capturing, and is seamlessly integrated with the structured Pino logger.

Deploy to Vercel with one click:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FMedal-Social%2FNextMedal.git)

### Docker Support

You can build a production-ready Docker image using the provided script:

```bash
pnpm docker:build
```

This script automatically pulls required build-time variables from your `.env` and creates an image named `nextmedal`. You can specify a custom image name as an argument:

```bash
./scripts/docker-build.sh my-custom-image-name
```

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

## Marketing Assets 🎨

Promote your project with our high-quality marketing assets. You can find these in the `public/` directory.

### Open Graph Image Template
Customize this SVG to create stunning social share images for your project.
`public/og-image-template.svg`

### Built with Medal Social
Add these badges to your footer or README to show your support.

**Banner**
![Built with Medal Social Banner](public/built-with-medal-social-banner.svg)


## License

NextMedal is licensed under the Apache License 2.0.

---

Built with ❤️ by [Medal Social](https://medalsocial.com) in Norway
