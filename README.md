# Vexan: Creative Agency Astro Theme

Vexan is a bold, animation-rich Astro theme for creative agencies, studios and freelancers. It ships with a home page, about, portfolio, blog, contact and style-guide pages, CMS-driven project, service and article pages powered by **Strapi**, and smooth GSAP scroll animations.

**Live demo:** https://vexan-astro-theme.vercel.app

## Tech stack

- **Astro 7**: static output, zero UI framework
- **Strapi 5** headless CMS (in `./strapi`) with the **Strapi MCP server** enabled, so you can manage content from AI clients
- **GSAP 3** (ScrollTrigger + SplitText) and **Lenis** smooth scrolling, bundled locally (no CDN scripts)
- Plain CSS: the original design system with CSS custom properties, no Tailwind required
- `@astrojs/sitemap`, Open Graph/Twitter meta, canonical URLs

## Pages

| Route | Content |
|---|---|
| `/` | Home: hero, story, services, featured projects, process, stats, testimonials, blog |
| `/about` | About, values, process, team, recognition, FAQ |
| `/project`, `/project/[slug]` | Portfolio grid and project case studies (Strapi: Project) |
| `/service/[slug]` | Service detail pages (Strapi: Service) |
| `/blog`, `/blog/[slug]` | Blog list and articles (Strapi: Blog) |
| `/contact` | Contact form + details |
| `/style-guide`, `/licenses`, `/changelog`, `/instructions`, `/404` | Utility pages |

## Getting started

Requires **Node.js 22.12+**.

```bash
npm install
npm run dev          # http://localhost:4321
```

The site runs immediately with the bundled demo content (`src/data/*.json`, images in `public/cms/`).

### Connect Strapi

```bash
npm run strapi:install
cp strapi/.env.example strapi/.env   # then replace the secrets
npm run strapi:dev                   # http://localhost:1337/admin
```

On first start Strapi creates the **Blog**, **Project** and **Service** collections, grants public read access, and imports the demo content and images. Then point Astro at it:

```bash
cp .env.example .env
# STRAPI_URL=http://localhost:1337
npm run build
```

Content is read at build time. In production, add a Strapi webhook (Settings → Webhooks, events "entry.publish/update/delete") that calls your host's deploy hook so the site rebuilds when content changes.

### Manage content with AI (Strapi MCP)

The MCP server is enabled in `strapi/config/server.ts`. Create an **Admin API token** in Strapi (Settings → Admin API Tokens), then for Claude Code:

```bash
claude mcp add strapi-mcp --transport http http://localhost:1337/mcp --header "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

Your AI client can now list, create, update and publish Blog, Project and Service entries.

## Project structure

```
├── public/              images, favicons, demo CMS media (public/cms)
├── src/
│   ├── components/
│   │   ├── global/      Header, Footer, NavMenu, SeoMeta, PrimaryButton, SectionSubtitle, Faq
│   │   ├── cards/       BlogCard, ProjectCard, ServiceCard
│   │   ├── sections/    page sections grouped by page
│   │   └── ui/          SliderArrows
│   ├── config/          config.json, menu.json, faq.json  ← edit these first
│   ├── data/            demo content (used when STRAPI_URL is empty and by the Strapi seeder)
│   ├── layouts/         BaseLayout.astro
│   ├── lib/             cms.ts (Strapi client), types.ts, utils.ts
│   ├── pages/           routes
│   ├── scripts/         animations, navbar, slider, forms
│   └── styles/          design system CSS + custom.css
├── strapi/              Strapi 5 project (content types in src/api, seeder in src/seed.ts)
└── .claude/skills/      AI agent guide for this template (SKILL.md + references)
```

## Customization

- **Brand, SEO, contact details, footer:** `src/config/config.json`
- **Navigation and social links:** `src/config/menu.json`
- **FAQ:** `src/config/faq.json`
- **Contact form:** set `PUBLIC_FORM_ENDPOINT` (Formspree, Web3Forms, Basin…)
- **Colors and typography:** CSS variables at the top of `src/styles/vexan.webflow.css`
- **Animations:** add attributes such as `page-scroll-1` or `heading-style-2` to any element (see `src/scripts/animations.ts`)

Full guide: [THEME-CUSTOMIZATION.md](./THEME-CUSTOMIZATION.md).

## Commands

| Command | Action |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` | Build to `./dist` |
| `npm run preview` | Preview the build |
| `npm run format` | Format the source with Prettier |
| `npm run strapi:install` / `strapi:dev` / `strapi:build` / `strapi:start` | Strapi commands |

## Deployment

Static output: deploy `dist/` to Vercel, Netlify, Cloudflare Pages or any static host. Set `SITE_URL`, `STRAPI_URL` (and optionally `STRAPI_API_TOKEN`, `PUBLIC_FORM_ENDPOINT`) as environment variables. Deploy Strapi separately (Strapi Cloud, Railway, Render, a VPS) with PostgreSQL.

## Credits

- Fonts: [Inter Tight](https://fonts.google.com/specimen/Inter+Tight) and [Geist](https://fonts.google.com/specimen/Geist) (SIL Open Font License)
- Images: [Pexels](https://www.pexels.com/license/)
- Icons: [Hugeicons](https://hugeicons.com/license-agreement)
- Animation: [GSAP](https://gsap.com) (free standard license), [Lenis](https://github.com/darkroomengineering/lenis) (MIT)

## License

See [LICENSE](./LICENSE).
