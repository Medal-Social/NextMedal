# NextMedal Quickstart Guide

Get NextMedal running in **5 minutes** with this step-by-step guide. Perfect for first-time users!

---

## ⚠️ Critical Requirements (Read First!)

**NextMedal requires specific versions of Node.js and package manager:**

### 1. Node.js 24 or Later (REQUIRED)

**Why?** NextMedal uses Next.js 16 and React 19, which require Node 24+.

**Check your version:**
```bash
node --version
# Should show v24.x.x or higher
```

**Don't have Node 24+?** Install it:
- **Recommended:** Use [nvm](https://github.com/nvm-sh/nvm) (version manager)
  ```bash
  # Install nvm, then:
  nvm install 24
  nvm use 24
  ```
- **Alternative:** Download from [nodejs.org](https://nodejs.org/) (choose "Current" version)

### 2. pnpm Package Manager (REQUIRED)

**Why?** This project uses `pnpm` for dependency management (NOT `npm` or `yarn`).

**The project will FAIL if you try to use npm or yarn.** 🚫

**Install pnpm:**
```bash
npm install -g pnpm
# Or using brew on macOS:
brew install pnpm
```

**Verify installation:**
```bash
pnpm --version
# Should show 10.x.x or higher
```

---

## Prerequisites Checklist

Before you begin, make sure you have:

- ✅ **Node.js 24+** - `node --version` shows v24.x.x or higher
- ✅ **pnpm** - `pnpm --version` works
- ✅ **Git** - [Download here](https://git-scm.com/) if needed
- ✅ **A Sanity account** - Free tier works! [Sign up](https://www.sanity.io/)
- ✅ **A Medal Social API key** - required for forms and for Cloudflare deploys (`MEDAL_API_KEY`). Create one under **Settings → API keys** in your Medal Social workspace ([Authentication & API keys](https://www.medalsocial.com/docs/sdk/authentication)).

---

## Step 1: Clone & Install

```bash
# Clone the repository
git clone https://github.com/Medal-Social/NextMedal.git
cd NextMedal

# Install dependencies
pnpm install

# Pull agent skills from dependencies (writes AGENTS.md)
pnpm intent
```

The `pnpm intent` step runs [`@tanstack/intent install`](https://tanstack.com/intent), which writes a small managed block to `AGENTS.md` instructing your AI coding agent (Claude Code, Cursor, Copilot, etc.) how to discover and load skills shipped by your dependencies (e.g. `@medalsocial/sdk` ships skills for the `Medal` client + resources). Re-run after bumping any intent-enabled dependency.

---

## Step 2: Create a Sanity Project

You need a Sanity project to manage your content. Here's how:

### Option A: Use an Existing Project

If you already have a Sanity project:
1. Go to [sanity.io/manage](https://www.sanity.io/manage)
2. Find your **Project ID** and **Dataset name**
3. Skip to **Step 3** below

### Option B: Create a New Project

1. **Go to** [sanity.io/manage](https://www.sanity.io/manage)
2. **Click** "Create Project"
3. **Name** your project (e.g., "My NextMedal Site")
4. **Choose** a plan (free tier is fine)
5. **Note down** your **Project ID** (looks like `abc123xyz`)
6. Your dataset will be called `production` by default

7. **Configure CORS** (Important! ⚠️)
   - In your project settings, go to **API** → **CORS Origins**
   - Click **Add CORS Origin**
   - Enter: `http://localhost:3000`
   - Check **Allow credentials**
   - Click **Save**

   **Why?** Without this, you'll get blocked when accessing the Studio at `/studio`

---

## Step 3: Configure Environment Variables

1. **Copy** the example env file:
   ```bash
   cp .env.example .env.local
   ```

2. **Edit** `.env.local` and fill in these **required** values:

   ```bash
   # Your Sanity project ID (from Step 2)
   NEXT_PUBLIC_SANITY_PROJECT_ID=abc123xyz

   # Your dataset name (usually "production")
   NEXT_PUBLIC_SANITY_DATASET=production

   # Base URL for local development
   NEXT_PUBLIC_BASE_URL=http://localhost:3000
   ```

3. **Add `MEDAL_API_KEY`** (needed for forms; required to deploy):

   `MEDAL_API_KEY` is the Medal Social API key: a single bearer key in `@medalsocial/sdk` 1.x (it replaces the legacy client id and secret pair). Contact forms, newsletter sign-ups, and event registrations go to [Medal Social](https://medalsocial.com) only, through `@medalsocial/sdk`. Nothing is stored in Sanity, whose dataset is public. Without the key, every form answers "We couldn't send your message right now".

   **Where to get it.** In your Medal Social workspace, open **Settings → API keys** and create a key. Keys are prefixed `medal_` and scoped to one workspace. See [Authentication & API keys](https://www.medalsocial.com/docs/sdk/authentication). The key needs the scopes `read:contacts` and `write:contacts` (dotted: `crm.contact.read`, `crm.activity.read`, `write:contacts`, `crm.contact.note.create`).

   **Where to set it locally.** `pnpm dev` reads `.env.local`. The key is server-only. Leave off the `NEXT_PUBLIC_` prefix so it is not shipped to the browser.

   ```bash
   # Needed for forms (contact, newsletter, event registration):
   MEDAL_API_KEY=medal_your_key_here

   # Optional. Overrides the API base URL. Leave unset to use the SDK default.
   # MEDAL_API_ENDPOINT=
   ```

   A local Worker preview (`pnpm preview`) does not read `.env.local`. Copy `.dev.vars.example` to `.dev.vars` and set `MEDAL_API_KEY` there as well.

   `pnpm setup:check` does not require this key, and the dev server still starts without it. Forms will not send until it is set. Cloudflare deploys fail when it is empty. See [Step 8](#step-8-deploy).

4. **(Optional but recommended)** Create a Sanity API token for live preview:
   - Go to [sanity.io/manage](https://www.sanity.io/manage) → Your Project → **API** → **Tokens**
   - Click **Add API Token**
   - Name: "NextMedal Browser Token"
   - Permissions: **Viewer**
   - Copy the token and add it to `.env.local`:
     ```bash
     NEXT_PUBLIC_SANITY_BROWSER_TOKEN=your_token_here
     ```

---

## Step 4: Validate Your Setup

Run the validation script to check everything is configured:

```bash
pnpm setup:check
```

✅ **If all checks pass**, you're ready to go!
❌ **If checks fail**, follow the fix instructions shown in the output

---

## Step 5: Start the Development Server

```bash
pnpm dev
```

Your site will be available at:
- **Frontend:** http://localhost:3000
- **Sanity Studio:** http://localhost:3000/studio

---

## Step 6: Access Sanity Studio & Deploy Schema

1. **Open** http://localhost:3000/studio in your browser

2. **Login** with your Sanity account (if prompted)

3. **Deploy your schema** (First time only):

   **Option A - Automatic (Recommended):**
   - The schema will auto-deploy when you first access the Studio
   - Just wait for it to load

   **Option B - Manual:**
   - Run in a separate terminal:
     ```bash
     npx sanity schema deploy
     ```

**If you get a CORS error:**
- Go to [sanity.io/manage](https://www.sanity.io/manage) → Your Project → **API** → **CORS Origins**
- Add `http://localhost:3000` with **Allow credentials** checked
- Refresh the Studio

---

## Step 7: Create Your First Page

1. **Open** http://localhost:3000/studio in your browser

2. **Login** with your Sanity account (if prompted)

3. **Create an index page:**
   - Click **"Create"** (or the + button)
   - Select **"Page"** from the document types
   - Fill in the fields:
     - **Title:** "Home" (or whatever you want)
     - **Slug:** Click "Generate" and it should create "home", then **change it to "index"**
     - **Add some modules** (optional - you can add a hero, text, images, etc.)

4. **Publish** the page:
   - Click the green **"Publish"** button in the top-right corner

5. **View your site:**
   - Go to http://localhost:3000
   - You should now see your homepage! 🎉

---

## Step 8: Deploy

Production and staging run on **Cloudflare Workers**. A push to `dev` deploys staging (`staging.nextmedal.com`); a push to `prod` deploys production (`nextmedal.com` and `www`). Both GitHub workflows stay off until the repository variable `CLOUDFLARE_DEPLOY_ENABLED` is `true`. The rest of the setup (Cloudflare token, account id, optional analytics) is in [docs/CLOUDFLARE.md](./docs/CLOUDFLARE.md).

**Where to set `MEDAL_API_KEY` for a deploy.** Add it as a secret on the GitHub **Staging** and **Prod** environments (Settings → Secrets and variables → Actions → Environments). The workflows read `secrets.MEDAL_API_KEY` and **fail before building** when that secret is empty. A Worker without the key would answer every form with "We couldn't send your message right now". After the Worker deploys, the workflow uploads the same value with `wrangler secret put`. It stays a Worker secret, not a plaintext var.

`MEDAL_API_ENDPOINT` is optional. Set it on the same environments only when you need a non-default API base URL. An empty value is deleted from the Worker so an old endpoint does not linger.

Use the same key scopes as in [Step 3](#step-3-configure-environment-variables): `read:contacts` and `write:contacts` (dotted: `crm.contact.read`, `crm.activity.read`, `write:contacts`, `crm.contact.note.create`).

---

## What's Next?

### Explore the Studio

- Create more pages, article posts, events, documentation
- Upload images and videos
- Customize your content

### Customize Your Site

- **Schemas:** `src/sanity/schemaTypes/` - Define content structure
- **UI Components:** `src/ui/` and `src/components/ui/` - Reusable components
- **Pages:** `src/app/(frontend)/[locale]/` - Next.js routes
- **Styling:** Tailwind CSS is configured - edit classes directly

### Add More Features

- Enable **analytics** (Umami) - see `.env.example`
- Configure **i18n** - already set up for Norwegian and English!

---

## Troubleshooting

### "This project requires Node.js 24 or higher" error

**Problem:** You're using an older version of Node.js

**Solution:**
```bash
# Check your current version
node --version

# Install Node 24+ using nvm (recommended)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 24
nvm use 24

# Verify
node --version
```

---

### "This project requires pnpm" or "npm/yarn not allowed" error

**Problem:** You tried to use npm or yarn instead of pnpm

**Solution:**
```bash
# Install pnpm globally
npm install -g pnpm

# Remove node_modules if they exist
rm -rf node_modules

# Install with pnpm
pnpm install

# Always use pnpm for this project:
pnpm dev          # NOT npm run dev
pnpm build        # NOT npm run build
```

**Why pnpm?** The project enforces pnpm because:
- Faster installs and less disk space
- Better dependency resolution
- The lockfile format is optimized for pnpm

---

### "pnpm command not found"

**Problem:** pnpm is not installed globally

**Solution:**
```bash
# Install pnpm
npm install -g pnpm

# Or with Homebrew (macOS/Linux)
brew install pnpm

# Verify
pnpm --version
```

---

### "Blocked by CORS policy" or Studio won't load

**Problem:** Your localhost origin is not allowed in Sanity

**Solution:**
```bash
# 1. Go to Sanity management console
open https://www.sanity.io/manage

# 2. Select your project
# 3. Navigate to: API → CORS Origins
# 4. Click: Add CORS Origin
# 5. Enter: http://localhost:3000
# 6. Check: ✅ Allow credentials
# 7. Click: Save
# 8. Refresh your Studio at /studio
```

**Common CORS origins you might need:**
- `http://localhost:3000` - Local development (REQUIRED)
- `http://localhost:3001` - Backup if port 3000 is in use
- Your production URL (e.g., `https://yourdomain.com`)

---

### Studio shows "Invalid credentials" or won't authenticate

**Problem:** CORS not configured or wrong project ID

**Solution:**
1. Verify your `NEXT_PUBLIC_SANITY_PROJECT_ID` in `.env.local` matches your project on sanity.io
2. Make sure CORS origin is added for `http://localhost:3000` (see above)
3. Try logging out and back in: Click your profile icon → Log out → Refresh page

---

### Forms say "We couldn't send your message right now"

**Problem:** `MEDAL_API_KEY` is missing or empty, so the submission is not sent to Medal Social.

**Solution:**
1. Create a key in your Medal Social workspace under **Settings → API keys** (scopes `read:contacts` and `write:contacts`). See [Authentication & API keys](https://www.medalsocial.com/docs/sdk/authentication).
2. Set `MEDAL_API_KEY` in `.env.local` and restart `pnpm dev`.
3. For `pnpm preview`, set it in `.dev.vars` (copied from `.dev.vars.example`).

---

### Cloudflare deploy fails: `MEDAL_API_KEY is empty`

**Problem:** The **Staging** or **Prod** GitHub environment has no `MEDAL_API_KEY` secret. The workflow exits before the build.

**Solution:**
1. Add `MEDAL_API_KEY` to that environment (Settings → Secrets and variables → Actions → Environments).
2. Re-run the workflow. The key is uploaded to the Worker as a secret after deploy.
3. Details: [Step 8](#step-8-deploy) and [docs/CLOUDFLARE.md](./docs/CLOUDFLARE.md).

---

### "Invalid environment variables" error

**Problem:** Missing or incorrect env vars in `.env.local`

**Solution:**
```bash
# Run the validation script
pnpm setup:check

# Fix any failed checks shown in the output
```

---

### Blank page at http://localhost:3000

**Problem:** No index page exists in Sanity

**Solution:**
1. Go to http://localhost:3000/studio
2. Create a Page document with slug = "index"
3. Publish it
4. Refresh http://localhost:3000

---

### "Project not found" in Sanity Studio

**Problem:** Wrong `NEXT_PUBLIC_SANITY_PROJECT_ID` in `.env.local`

**Solution:**
1. Check your Project ID at [sanity.io/manage](https://www.sanity.io/manage)
2. Update `.env.local` with the correct ID
3. Restart `pnpm dev`

---

### Changes not appearing on site

**Problem:** Content is a draft, not published

**Solution:**
1. Open http://localhost:3000/studio
2. Find your document
3. Click **"Publish"** (not just "Save")
4. Refresh your site

---

### Port 3000 already in use

**Problem:** Another app is using port 3000

**Solution:**
```bash
# Option 1: Stop the other app
lsof -ti:3000 | xargs kill

# Option 2: Use a different port
PORT=3001 pnpm dev
# Then visit http://localhost:3001
```

---

## Need More Help?

- 📖 **Full Documentation:** See [README.md](./README.md) and [CLAUDE.md](./CLAUDE.md)
- 🐛 **Report Issues:** [GitHub Issues](https://github.com/Medal-Social/NextMedal/issues)
- 💬 **Get Support:** [Medal Social](https://www.medalsocial.com)
- 📚 **Sanity Docs:** [sanity.io/docs](https://www.sanity.io/docs)
- 📚 **Next.js Docs:** [nextjs.org/docs](https://nextjs.org/docs)

---

**Built with ❤️ by [Medal Social](https://www.medalsocial.com) in Norway**
