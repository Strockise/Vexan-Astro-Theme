# Vexan Theme Customization Guide

This guide covers everything you can change without touching the page markup.

## 1. Site settings: `src/config/config.json`

| Key | What it controls |
|---|---|
| `site.name`, `site.brand` | Brand name (Open Graph site name) |
| `site.titleSuffix` | Appended to page titles: `About | <titleSuffix>` |
| `site.url` | Fallback site URL (prefer the `SITE_URL` env variable) |
| `site.logo`, `site.logoHero`, `site.logoFooter` | Header logo, large home-hero logo, footer logo (files in `public/images/`) |
| `seo.title`, `seo.description`, `seo.image` | Home page title and default description / social image |
| `contact.*` | Email, phones, opening hours, address and contact-page social links |
| `footer.*` | Footer summary, CTA heading and button, copyright, credit link |
| `header.cta`, `header.mobileCta` | Navbar buttons (desktop and mobile menu) |
| `forms.endpoint` | Contact form endpoint (or set `PUBLIC_FORM_ENDPOINT`) |

Keep demo data generic if you publish the theme: `example.com` addresses, `555-01xx` phone numbers and root-domain social links.

## 2. Navigation: `src/config/menu.json`

- `main`: header links (`label`, `href`). The active page gets the `w--current` class automatically.
- `footer`: two columns of footer links.
- `social`: footer social links.

## 3. FAQ: `src/config/faq.json`

Edit `heading`, `summary` and the `items` array. Numbers (01., 02.…) are added automatically. The FAQ appears on about, blog, contact, project and service pages. To show different questions on one page, pass `items`: `<Faq items={[{ question: '…', answer: '…' }]} />`.

## 4. CMS content (Strapi)

### Content types

| Collection | Fields | Used on |
|---|---|---|
| **Blog** | `title`, `homeTitle`, `slug`, `summary`, `homeSummary`, `readTime`, `date`, `image` (home card), `mainImage` (blog cards, social image), `thumbnailImage` (article hero), `detailsTitle`, `detailsSummary`, `content` (rich text), `order` | `/`, `/blog`, `/blog/[slug]` |
| **Project** | `title`, `slug`, `mainImage`, `thumbnailImage`, `year`, `detailsTitle`, `detailsSummary`, `industry`, `service`, `duration`, `role`, `gallery`, `overview`, `challenge`, `goals`, `featureImage`, `clientQuote`, `clientName`, `clientPosition`, `clientAvatar`, `order` | `/`, `/project`, `/project/[slug]` |
| **Service** | `title`, `slug`, `cardNumber`, `summary`, `image`, `arrowIcon`, `thumbnailImage`, `gallery`, `detailsTitle`, `summaryTwo`, `quickStats`, `overview`, `deliverables`, `order` | `/` (services track), `/service/[slug]` |

Schemas live in `strapi/src/api/<type>/content-types/<type>/schema.json`. If you add a field, also add it to `src/lib/types.ts` and use it in the component.

- **Order:** lists are sorted by the `order` field (ascending).
- **Rich text:** fields accept Markdown or HTML (rendered inside `.w-richtext`, so headings, lists, quotes and images are styled automatically).
- **Layouts with fixed slots:** the home page shows projects 1–6 and posts 1–5, and the blog page features posts 1–2 at the top. The blog grid repeats its masonry pattern for any number of posts.

### Workflow

1. `npm run strapi:dev`, then create your admin account at `http://localhost:1337/admin`.
2. Edit or add entries and click **Publish** (only published entries appear on the site).
3. Set `STRAPI_URL` in `.env` and run `npm run build` (or `npm run dev`).
4. In production, add a Strapi webhook that triggers your host's deploy hook.

### Demo content and seeding

`strapi/src/seed.ts` runs on Strapi start and imports `src/data/*.json` + `public/cms/*` into empty collections. Set `SEED_DEMO_CONTENT=false` in `strapi/.env` to disable it. Without Strapi (`STRAPI_URL` empty) the site reads the same JSON files directly.

### Managing content with AI (MCP)

Strapi's MCP server is enabled (`strapi/config/server.ts`, `MCP_ENABLED`). Create an **Admin API token** (Settings → Admin API Tokens) and connect your AI client:

```bash
# Claude Code
claude mcp add strapi-mcp --transport http http://localhost:1337/mcp --header "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

The token's permissions decide which tools the AI can use (find, create, update, delete, publish, unpublish). The MCP server can't create content types or upload new files: upload media in the Media Library first, then reference it.

## 5. Contact form

The form posts `FormData` to `PUBLIC_FORM_ENDPOINT` and shows the original success/error messages.

- **Formspree:** `PUBLIC_FORM_ENDPOINT=https://formspree.io/f/xxxxxxx`
- **Web3Forms:** add a hidden `access_key` input in `src/components/sections/contact/Contact.astro`, endpoint `https://api.web3forms.com/submit`
- With no endpoint (demo mode), the success message is shown and nothing is sent.

A hidden honeypot field (`_gotcha`) filters basic spam.

## 6. Colors, fonts and spacing

All design tokens are CSS custom properties at the top of `src/styles/vexan.webflow.css` (`--_colors---main-color--primary-color`, `--_typography---font-family--heading-font-family`, spacing variables…). Change them there to restyle the whole site.

- Fonts are loaded from Google Fonts in `src/layouts/BaseLayout.astro`. To change a font, update that `<link>` and the font-family variables.
- Put your own CSS in `src/styles/custom.css`, which loads last. Avoid editing `normalize.css` and `webflow.css`.

## 7. Animations

Animations are in `src/scripts/animations.ts` (GSAP + ScrollTrigger + SplitText). Add an attribute to any element:

| Attribute | Effect |
|---|---|
| `page-load-1`, `page-load-3`, `page-load-4`, `page-load-5` | Fade up on page load (0 / 0.4 / 0.6 / 0.8 s delay) |
| `page-scroll-1`, `page-scroll-2`, `page-scroll-3` | Fade up when scrolled into view (0 / 0.4 / 0.6 s) |
| `top-delay-0`, `top-delay-2`, `top-delay-3` | Fade up into view (0 / 0.2 / 0.4 s) |
| `heading-style-1` | Line-by-line reveal on load (page `<h1>`) |
| `heading-style-2` | Line-by-line reveal on scroll |
| `scroll-list` | Children fade up one after another on scroll |
| `load-stagger` | Children fade up one after another on load |

Users with "reduce motion" enabled get no animations. Smooth scrolling (Lenis) is configured in `src/scripts/main.ts`.

## 8. Adding a page

1. Create `src/pages/my-page.astro`:

   ```astro
   ---
   import BaseLayout from '../layouts/BaseLayout.astro';
   ---
   <BaseLayout title="My Page" description="…">
     <section class="section-gap"><div class="w-layout-blockcontainer container-main w-container">…</div></section>
   </BaseLayout>
   ```

2. Add it to `src/config/menu.json`.

Reuse existing sections from `src/components/sections/` and the global components (`PrimaryButton`, `SectionSubtitle`, `Faq`).

## 9. SEO

Every page sets its title and description through `BaseLayout` props. CMS pages use the entry's title, summary and image. A sitemap is generated at `/sitemap-index.xml`; set `SITE_URL` for correct absolute URLs.
