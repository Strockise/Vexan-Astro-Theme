# Adding New Pages, Routes or Sections

## A static page

Create `src/pages/<name>.astro`. The file name is the URL (`src/pages/pricing.astro` → `/pricing`).

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import SectionSubtitle from '../components/global/SectionSubtitle.astro';
import PrimaryButton from '../components/global/PrimaryButton.astro';
import Faq from '../components/global/Faq.astro';
---

<BaseLayout title="Pricing" description="Plans and pricing.">
  <section class="section_contact">
    <div class="contact-gap">
      <div class="w-layout-blockcontainer container-main w-container">
        <div page-load-1="" class="section-subtitle-block"><SectionSubtitle text="PRICING" /></div>
        <h1 heading-style-1="" class="heading-style-h1">Simple, transparent pricing</h1>
        <PrimaryButton href="/contact" label="Get Started" />
      </div>
    </div>
  </section>
  <Faq />
</BaseLayout>
```

- `title` becomes `Pricing | Vexan - Creative Agency Astro Theme`. Pass `appendSuffix={false}` to use it verbatim.
- Use only one `<h1>` per page.
- Then add the link in `src/config/menu.json` (`main` for the header, `footer` for footer columns).

## BaseLayout props

| Prop | Default | Purpose |
|---|---|---|
| `title` | site title | Page title |
| `appendSuffix` | `true` | Append the site suffix to `title` |
| `description` | `config.seo.description` | Meta description |
| `image` | `config.seo.image` | Social image (path in `public/` or absolute URL) |
| `type` | `website` | `article` for posts |
| `noindex` | `false` | Adds `robots: noindex` |
| `showHeader` | `true` | The home page hides the header (its hero has its own navbar) |
| `bare` | `false` | Skip the page/main wrappers (used by 404) |

## A new CMS-driven route

1. Add the content type in Strapi (`strapi/src/api/<name>/…`, copy an existing one), restart Strapi.
2. Add an interface in `src/lib/types.ts` and a getter in `src/lib/cms.ts` (`load<T>('<plural>', fallbackJson)`), plus fallback data in `src/data/<plural>.json`.
3. Create `src/pages/<name>/[slug].astro`:

```astro
---
import type { GetStaticPaths } from 'astro';
export const getStaticPaths = (async () => {
  const items = await getThings();
  return items.map((item) => ({ params: { slug: item.slug }, props: { item } }));
}) satisfies GetStaticPaths;
const { item } = Astro.props;
---
```

## A new section

Put it in `src/components/sections/<page>/<Name>.astro` and import it into the page. Reuse existing CSS classes (`section-gap`, `container-main`, `heading-style-2`, …) so it matches the design. Add animation attributes (see styling-and-theming.md) to animate it.
