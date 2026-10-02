# Script Usage

The project uses **npm** (pnpm/yarn work too: replace `npm run` with `pnpm`). Node.js 22.12+.

| Command | What it does |
|---|---|
| `npm install` | Install the Astro site dependencies |
| `npm run dev` | Dev server at http://localhost:4321 (hot reload) |
| `npm run build` | Static build to `./dist` (reads Strapi if `STRAPI_URL` is set) |
| `npm run preview` | Serve `./dist` locally |
| `npm run format` | Prettier (with the Astro plugin) over `src/` |
| `npm run strapi:install` | Install Strapi dependencies in `./strapi` |
| `npm run strapi:dev` | Strapi in development mode (admin at http://localhost:1337/admin, Content-Type Builder enabled) |
| `npm run strapi:build` | Build the Strapi admin panel |
| `npm run strapi:start` | Run Strapi in production mode |

## Typical workflows

**First run with demo content only:** `npm install && npm run dev`

**Full CMS setup:**

```bash
npm install
npm run strapi:install
cp strapi/.env.example strapi/.env    # replace the secrets
npm run strapi:dev                    # seeds demo content on first start
cp .env.example .env                  # STRAPI_URL=http://localhost:1337
npm run dev
```

**Reset the local CMS:** stop Strapi, delete `strapi/.tmp/data.db` and the files in `strapi/public/uploads/`, start again (the seeder re-imports the demo content).

## Client scripts (`src/scripts/`)

| File | Role |
|---|---|
| `main.ts` | Entry: Lenis smooth scroll, then initialises everything below |
| `nav.ts` | Webflow-compatible navbar (`.w-nav`): mobile overlay, keyboard, outside click |
| `slider.ts` | `.w-slider` replacement: arrows, numbered dots, swipe, keyboard |
| `forms.ts` | Contact form submission, success/error states, custom radios |
| `animations.ts` | GSAP rebuild of every Webflow interaction (see styling-and-theming.md) |
