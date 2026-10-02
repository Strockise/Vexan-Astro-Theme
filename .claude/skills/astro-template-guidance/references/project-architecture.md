# Project Architecture

Vexan is a static **Astro 7** site converted 1:1 from a Webflow design, with **Strapi 5** as an optional headless CMS.

## Folder map

```
src/
  config/        config.json (site/SEO/contact/footer), menu.json (navigation), faq.json
  data/          demo CMS content: blogs.json, projects.json, services.json
  lib/
    cms.ts       getBlogs() / getProjects() / getServices(): Strapi when STRAPI_URL is set, else src/data
    types.ts     Blog, Project, Service interfaces (mirror the Strapi schemas)
    utils.ts     isCurrent(), renderRichText(), formatDate(), telHref()
  layouts/
    BaseLayout.astro   <head> (SeoMeta, fonts, generator meta), Header, Footer, client script
  components/
    global/      Header, NavMenu, Footer, SeoMeta, PrimaryButton, SectionSubtitle, Faq
    cards/       BlogCard (5 variants), ProjectCard (feature/grid), ServiceCard
    sections/    one component per page section, grouped by page (home/, about/, blog/, …)
    ui/          SliderArrows
  pages/         routes; CMS routes use getStaticPaths (blog/[slug], project/[slug], service/[slug])
  scripts/       main.ts (entry) → nav.ts, slider.ts, forms.ts, animations.ts (+ Lenis)
  styles/        normalize.css, webflow.css, vexan.webflow.css (design system), custom.css
public/
  images/        theme images (with responsive -p-500/-p-800… variants used in srcset)
  cms/           demo CMS media
strapi/          Strapi 5 project: src/api/{blog,project,service}, src/seed.ts, src/index.ts
```

## Data flow

1. A page or section calls `await getBlogs()` (etc.) in its frontmatter.
2. `src/lib/cms.ts` fetches `GET {STRAPI_URL}/api/blogs?populate=*&sort=order:asc` at build time (paginated) and flattens media objects to URL strings. Without `STRAPI_URL` it returns `src/data/blogs.json` sorted by `order`.
3. Components receive typed objects (`Blog`, `Project`, `Service`) and render them with the original Webflow class names.
4. Output is static HTML. Content changes need a rebuild (use a Strapi webhook → deploy hook).

## Styling model

The original Webflow CSS is kept unchanged and loaded globally, so class names in the markup are the styling API. Don't rename classes such as `primary-button`, `w-variant-…`, `w-dyn-list` or `w-richtext`.

## Client-side JavaScript

Only one bundled script (`src/scripts/main.ts`) runs: Lenis smooth scroll, the navbar, the sliders, the contact form, and GSAP animations. There is no UI framework and no jQuery.
