// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { loadEnv } from 'vite';

const env = loadEnv(process.env.NODE_ENV ?? 'production', process.cwd(), '');

// https://astro.build/config
export default defineConfig({
  // Your production URL (used for canonical URLs, Open Graph and the sitemap).
  site: env.SITE_URL || 'https://example.com',
  trailingSlash: 'ignore',
  integrations: [sitemap({ filter: (page) => !page.includes('/404') })],
  build: { inlineStylesheets: 'auto' },
  // Hide the Astro dev toolbar (it overlays the bottom of the page in `npm run dev`).
  devToolbar: { enabled: false },
  vite: {
    // The Strapi project lives in ./strapi with its own dependencies: keep it out of Vite.
    server: { watch: { ignored: ['**/strapi/**'] } },
  },
});
