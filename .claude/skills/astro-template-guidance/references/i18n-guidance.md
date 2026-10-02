# Multi-language (i18n) Guidance

The template ships in **one language (English)** and has no i18n routing configured. To add languages:

## 1. Astro routing

In `astro.config.mjs`:

```js
export default defineConfig({
  i18n: { defaultLocale: 'en', locales: ['en', 'fr'], routing: { prefixDefaultLocale: false } },
});
```

Then mirror the pages under `src/pages/fr/` (e.g. `src/pages/fr/about.astro`) and set `<html lang>` per page. `config.site.lang` is the default.

## 2. UI strings

Move translatable strings from `src/config/*.json` into per-locale files (`src/config/en.json`, `src/config/fr.json`) and pick the file from `Astro.currentLocale`. Section components contain static copy; extract it into props or the locale files.

## 3. CMS content

Enable the **Internationalization** plugin in Strapi (Settings → Internationalization), add locales, and turn on localization for the Blog / Project / Service content types. Then pass the locale when fetching in `src/lib/cms.ts`:

```ts
url.searchParams.set('locale', locale); // e.g. 'fr'
```

and generate localized `getStaticPaths` routes (`src/pages/fr/blog/[slug].astro`).

## 4. Dates

`formatDate(iso, locale)` in `src/lib/utils.ts` accepts a locale (`'fr-FR'`).
