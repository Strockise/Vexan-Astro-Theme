# Content Management

Blog posts, projects and services come from **Strapi 5**. There are no Markdown/MDX content collections in this template; rich-text fields accept Markdown or HTML.

## Sources

- `STRAPI_URL` set in `.env` → content is fetched from Strapi at build time (`src/lib/cms.ts`).
- `STRAPI_URL` empty → content comes from `src/data/{blogs,projects,services}.json` (images in `public/cms/`).

## Editing in Strapi

1. `npm run strapi:dev` → `http://localhost:1337/admin`.
2. Content Manager → Blog / Project / Service → edit → **Publish**. Drafts never appear on the site.
3. `order` controls list order (ascending). The home page uses projects 1–6 and posts 1–5; the blog page features posts 1–2 in its hero.
4. Rebuild the site (or let a webhook trigger the deploy).

## Fields

- **Blog:** `title`, `homeTitle`, `slug`, `summary`, `homeSummary`, `readTime` (e.g. "6 MIN READ"), `date` (YYYY-MM-DD), `image`, `mainImage`, `thumbnailImage`, `detailsTitle`, `detailsSummary`, `content`, `order`
- **Project:** `title`, `slug`, `mainImage`, `thumbnailImage`, `year` (e.g. "{ 2025 }"), `detailsTitle`, `detailsSummary`, `industry`, `service`, `duration`, `role`, `gallery`, `overview`, `challenge`, `goals`, `featureImage`, `clientQuote`, `clientName`, `clientPosition`, `clientAvatar`, `order`
- **Service:** `title`, `slug`, `cardNumber` (e.g. "{ Service 01 }"), `summary`, `image`, `arrowIcon`, `thumbnailImage`, `gallery`, `detailsTitle`, `summaryTwo`, `quickStats`, `overview`, `deliverables`, `order`

## Editing without Strapi

Edit `src/data/*.json` directly (same field names; media are paths like `/cms/file.webp` pointing to `public/cms/`). The Strapi seeder imports the same files into empty collections on first start.

## AI content management (Strapi MCP)

The Strapi MCP server (`http://localhost:1337/mcp`, enabled in `strapi/config/server.ts`) lets AI clients find, create, update, publish and unpublish entries. Connect with an Admin API token:

```bash
claude mcp add strapi-mcp --transport http http://localhost:1337/mcp --header "Authorization: Bearer <ADMIN_TOKEN>"
```

Limitations: MCP can't create content types or upload new files. Upload media in the Media Library, then reference it by id.

## Adding a field

1. Add it to `strapi/src/api/<type>/content-types/<type>/schema.json` (or use the Content-Type Builder in development) and restart Strapi.
2. Add it to the interface in `src/lib/types.ts` (and to `MEDIA_FIELDS` in `src/lib/cms.ts` if it's a media field).
3. Render it in the relevant component.
