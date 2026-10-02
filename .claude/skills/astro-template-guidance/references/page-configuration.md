# Page Configuration (config.json, menu.json)

## `src/config/config.json`

```jsonc
{
  "site": { "name", "brand", "titleSuffix", "url", "lang", "logo", "logoHero", "logoFooter" },
  "seo": { "title", "description", "image" },          // home title + defaults for every page
  "contact": { "email", "phone", "phoneSecondary", "hours", "emailNote", "addressLine1", "addressLine2",
               "social": { "facebook", "x", "instagram" } },  // footer + contact page
  "footer": { "summary", "ctaSubtitle", "ctaHeading", "ctaButton": { "label", "href" }, "copyright", "rights",
              "credit": { "prefix", "label", "href" } },
  "header": { "cta": { "label", "href" }, "mobileCta": { "label", "href" } },
  "forms": { "endpoint" }                                // PUBLIC_FORM_ENDPOINT overrides it
}
```

- Page titles are `"<page title> | <site.titleSuffix>"`; the home page uses `seo.title`.
- `site.url` is a fallback. The real URL comes from `SITE_URL` (used in `astro.config.mjs` for canonical URLs and the sitemap).
- Logos are files in `public/images/`. Replace the SVGs or point the keys at new files.

## `src/config/menu.json`

```json
{
  "main":   [{ "label": "Home", "href": "/" }],
  "footer": [[{ "label": "Home", "href": "/" }], [{ "label": "Style Guide", "href": "/style-guide" }]],
  "social": [{ "label": "LinkedIn", "href": "https://linkedin.com" }]
}
```

- `main`: header and mobile menu links. Active links get `w--current` automatically (`isCurrent()` in `src/lib/utils.ts`).
- `footer`: an array of columns.
- `social`: footer social column (opens in a new tab).

## `src/config/faq.json`

`heading`, `summary`, `items[]` (`question`, `answer`).

## Per-page SEO

Pass `title`, `description`, `image`, `noindex` to `BaseLayout`. CMS detail pages use the entry's title/summary/image.

## Environment variables (`.env`)

| Variable | Purpose |
|---|---|
| `SITE_URL` | Production URL |
| `STRAPI_URL` | Strapi base URL (empty = bundled demo content) |
| `STRAPI_API_TOKEN` | Optional read-only token (server-side only) |
| `PUBLIC_FORM_ENDPOINT` | Contact form endpoint |
