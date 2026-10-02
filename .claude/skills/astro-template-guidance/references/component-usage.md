# Component Usage

All components are in `src/components/`. Props are typed with `interface Props`.

## Global

| Component | Props | Notes |
|---|---|---|
| `SeoMeta` | `title?`, `appendSuffix?`, `description?`, `image?`, `type?`, `noindex?` | Rendered by `BaseLayout`; outputs title, description, canonical, OG/Twitter, favicons |
| `Header` | none | Inner-page navbar. Logo from `config.site.logo`, links from `menu.main` |
| `NavMenu` | `items`, `ctaVariant?: 'v3' \| 'v4'` | The `w-nav-menu` shared by `Header` and the home hero |
| `Footer` | none | Reads `config.footer`, `config.contact`, `menu.footer`, `menu.social` |
| `PrimaryButton` | `href`, `label`, `variant?: 'v1' \| 'v2' \| 'v3' \| 'v4'`, `target?` | v1 orange (default), v2 white (footer), v3 navbar, v4 home hero navbar. Adds `w--current` on the active page |
| `SectionSubtitle` | `text`, `variant?: 'v1' \| 'v2'` | Renders `{ TEXT }`; v2 is for dark backgrounds |
| `Faq` | `variant?: 'base' \| 'compact'`, `items?` | Defaults to `src/config/faq.json` |

```astro
<PrimaryButton href="/contact" label="Contact Now" />
<SectionSubtitle text="OUR SERVICES" variant="v2" />
<Faq variant="compact" />
```

## Cards

| Component | Props | Variants |
|---|---|---|
| `BlogCard` | `post: Blog`, `variant` | `home-small`, `home-large` (home track: `homeTitle`, `homeSummary`, `image`), `large`, `small` (blog hero / similar articles: `mainImage`), `content` (blog grid: read time + date) |
| `ProjectCard` | `project: Project`, `variant?` | `feature` (home, cursor-following "View More"), `grid` (project page) |
| `ServiceCard` | `service: Service` | Home services track |

```astro
---
import { getBlogs } from '../lib/cms';
import BlogCard from '../components/cards/BlogCard.astro';
const posts = await getBlogs();
---
{posts.slice(0, 3).map((post) => <BlogCard post={post} variant="content" />)}
```

Keep the Webflow list wrappers when rendering lists (`.w-dyn-list > .w-dyn-items > .w-dyn-item`), because the grid CSS targets them.

## UI

- `SliderArrows`: arrows + dot nav for a `.w-slider` (behaviour in `src/scripts/slider.ts`). Slider markup: `.w-slider[data-duration][data-infinite] > .w-slider-mask > .w-slide*` followed by `<SliderArrows />`.

## Section components

`src/components/sections/<page>/*.astro` each render one section of a page. Static text lives in the section file; CMS sections call `getBlogs()` / `getProjects()` / `getServices()`; detail sections take the item as a prop (`<ProjectHero project={project} />`).
