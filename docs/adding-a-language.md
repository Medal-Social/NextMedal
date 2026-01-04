# Adding a Language to NextMedal

## Overview

NextMedal uses a centralized internationalization (i18n) system powered by `next-intl`. Adding a new language requires updates to configuration files, translation files, and date formatting. The architecture is designed so that **most components automatically pick up new languages** once configured.

**Key Principle**: Languages are defined in **one central location** (`src/i18n/routing.ts`), and the system automatically propagates this to Sanity schemas, URL routing, and components.

---

## Architecture Overview

### How i18n Works

1. **Central Configuration** (`src/i18n/config.ts` & `src/i18n/routing.ts`)
   - Defines supported locales and default locale
   - Configures locale-specific settings (display name, date formatting)
   - Used by Next.js routing and `next-intl`

2. **Automatic Propagation**
   - Sanity schemas use `getLanguageOptions()` to automatically include new languages
   - URL routing through Next.js `[locale]` dynamic segment
   - Collection slugs generated per locale via `pnpm generate:collections`

3. **Translation Files** (`src/messages/`)
   - JSON files containing UI strings for each language
   - Loaded by `next-intl` based on current locale

---

## Step-by-Step Guide

### Step 1: Update Core i18n Configuration

#### 1.1 Add Language Code to Supported Locales

**File**: `src/i18n/config.ts`

```typescript
export const SUPPORTED_LOCALES = ['en', 'nb', 'ar', 'fr'] as const; // Add 'fr'
```

#### 1.2 Add Locale Configuration

**File**: `src/i18n/routing.ts`

Import the date-fns locale for your language:

```typescript
import { ar, enUS, fr, nb } from 'date-fns/locale'; // Add 'fr'
```

Add to `localeConfig`:

```typescript
export const localeConfig = {
  en: { title: 'English', dateLocale: enUS },
  nb: { title: 'Norsk', dateLocale: nb },
  ar: { title: 'العربية', dateLocale: ar },
  fr: { title: 'Français', dateLocale: fr }, // Add this
} as const;
```

**Notes**:
- `title` is the display name shown in the language switcher
- `dateLocale` from `date-fns/locale` formats dates correctly for the language
- If `date-fns` doesn't have your locale, use the closest alternative or `enUS` as fallback

---

### Step 2: Create Translation File

**File**: `src/messages/fr.json` (create new file)

Copy an existing language file and translate all strings:

```json
{
  "HomePage": {
    "title": "Bonjour le monde!"
  },
  "common": {
    "loading": "Chargement...",
    "error": "Erreur",
    "success": "Succès",
    "close": "Fermer",
    "cancel": "Annuler",
    "done": "Terminé",
    "processing": "Traitement...",
    "untitled": "Sans titre"
  },
  "pagination": {
    "previous": "Précédent",
    "next": "Suivant",
    "goToPrevious": "Aller à la page précédente",
    "goToNext": "Aller à la page suivante",
    "morePages": "Plus de pages"
  },
  "Accessibility": {
    "skipToContent": "Aller au contenu",
    "openSearch": "Ouvrir la recherche",
    "loadingTheme": "Chargement des options d'apparence",
    "mobileNavigation": "Menu de navigation mobile",
    "dismissBanner": "Fermer la bannière d'annonce",
    "required": "requis",
    "toggleTheme": "Basculer le mode",
    "changeLanguage": "Changer de langue"
  },
  "search": {
    "placeholder": "Rechercher...",
    "commandPlaceholder": "Rechercher des pages, articles, docs...",
    "noResults": "Aucun résultat trouvé. Essayez des mots-clés différents.",
    "categories": {
      "articles": "Articles",
      "documentation": "Documentation",
      "changelog": "Journal des modifications",
      "newsletter": "Newsletter",
      "pages": "Pages"
    }
  }
  // ... continue translating all keys
}
```

**Tips**:
- Use `src/messages/en.json` as the reference template
- Ensure **all keys** from English are present in your new language file
- Keep variable placeholders like `{locale}` unchanged
- Test thoroughly to catch missing translations

---

### Step 3: Regenerate Collection Configuration

Collections have **locale-specific slugs** (e.g., `/articles` in English, `/artikler` in Norwegian). After adding a language, regenerate the collection configuration:

```bash
pnpm generate:collections
```

**What this does**:
- Queries Sanity for pages with frontpage modules (e.g., Articles Frontpage)
- Generates locale-specific collection slugs
- Creates `src/lib/collections/generated/collections.generated.ts`
- Falls back to default slugs if Sanity query fails

---

### Step 4: (Optional) Add Right-to-Left (RTL) Support

If your language is RTL (like Arabic), ensure RTL styling is working:

**File**: `src/app/(frontend)/[locale]/layout.tsx`

Check that the layout includes `dir` attribute detection:

```typescript
<html lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'}>
```

Add your language code if needed:

```typescript
<html lang={locale} dir={['ar', 'he', 'fa'].includes(locale) ? 'rtl' : 'ltr'}>
```

---

### Step 5: Test the New Language

#### 5.1 Start Development Server

```bash
pnpm dev
```

#### 5.2 Test URL Routing

- **Default locale (English)**: `http://localhost:3000`
- **Norwegian**: `http://localhost:3000/nb`
- **Arabic**: `http://localhost:3000/ar`
- **French**: `http://localhost:3000/fr` ← Test your new language

#### 5.3 Test Language Switcher

1. Navigate to any page
2. Click the language switcher in the header
3. Verify your language appears with the correct display name
4. Switch to your language and verify translations appear

#### 5.4 Test Collection Pages

Visit collection pages in the new language:

- Articles: `http://localhost:3000/fr/articles`
- Docs: `http://localhost:3000/fr/docs`

If Sanity doesn't have content for the new language, you'll see empty states.

---

### Step 6: Add Content in Sanity Studio

#### 6.1 Language Selector in Sanity

Sanity schemas automatically include your new language because they use `getLanguageOptions()`:

```typescript
// src/sanity/lib/getLanguageOptions.ts
// This function reads from localeConfig and generates Sanity options
```

When you create or edit documents in Sanity Studio:

1. The **Language** field will show your new language
2. **Field-level internationalization** (if used) will include the new language
3. Create content in the new language for testing

#### 6.2 Create Collection Pages

If you have collection frontpages (e.g., Articles Frontpage), create localized versions:

1. Go to Sanity Studio (`/studio`)
2. Create a **Page** document with language set to your new language
3. Set the slug (e.g., `articles` for French)
4. Add a frontpage module (e.g., **Articles Frontpage**)
5. Publish the page
6. Run `pnpm generate:collections` to regenerate collection slugs

---

## Verification Checklist

Before deploying, verify:

- [ ] Language added to `SUPPORTED_LOCALES` in `src/i18n/config.ts`
- [ ] Language added to `localeConfig` in `src/i18n/routing.ts`
- [ ] Date-fns locale imported and configured
- [ ] Translation file created in `src/messages/[locale].json`
- [ ] All translation keys from English file are present
- [ ] `pnpm generate:collections` executed successfully
- [ ] Language appears in language switcher
- [ ] URL routing works (`/[locale]/...`)
- [ ] Translations display correctly on all pages
- [ ] Date formatting works correctly
- [ ] RTL styling works (if applicable)
- [ ] Collection pages work in the new language
- [ ] Sanity Studio shows the new language in document editors

---

## Common Issues

### Issue: Language Switcher Doesn't Show New Language

**Cause**: `localeConfig` not updated or dev server not restarted.

**Solution**:
1. Verify `src/i18n/routing.ts` includes your language
2. Restart dev server (`pnpm dev`)

### Issue: Missing Translations (Shows English Fallback)

**Cause**: Translation keys missing in your language file.

**Solution**:
1. Compare your file with `src/messages/en.json`
2. Add missing keys
3. Restart dev server

### Issue: Collection Pages 404 in New Language

**Cause**: Collection frontpage not created in Sanity, or generator not run.

**Solution**:
1. Create a Page document in Sanity with the new language
2. Add a frontpage module (e.g., Articles Frontpage)
3. Run `pnpm generate:collections`
4. Restart dev server

### Issue: Date Formatting Incorrect

**Cause**: Wrong `date-fns` locale or missing import.

**Solution**:
1. Check `date-fns/locale` for your language
2. Import and add to `localeConfig.dateLocale`
3. If not available, use closest alternative

---

## Advanced: Language-Specific Features

### Locale-Specific Collection Slugs

Collections can have different slugs per language. To configure:

1. Create a Page in Sanity with the new language (e.g., French)
2. Set a localized slug (e.g., `articles` → `articles` in French, or `artikler` in Norwegian)
3. Add the appropriate frontpage module
4. Run `pnpm generate:collections`

The generator will detect the slug and use it for that language.

### Field-Level Internationalization in Sanity

Some schemas use `internationalizedArray` fields (see `collection.newsletter`):

```typescript
defineField({
  name: 'title',
  type: 'internationalizedArrayString', // Field-level i18n
})
```

These fields store all language versions in one document. When you add a language:

- The field automatically includes the new language
- Editors can add content for each language in one document
- No action needed beyond core i18n setup

---

## Summary

Adding a language involves:

1. **Update i18n configuration** (`config.ts`, `routing.ts`)
2. **Create translation file** (`messages/[locale].json`)
3. **Regenerate collections** (`pnpm generate:collections`)
4. **(Optional) Add RTL support** if needed
5. **Test thoroughly** across all pages
6. **Add content in Sanity** for the new language

The architecture is designed to **minimize manual work**—once you update the central configuration, most of the system automatically adapts.
