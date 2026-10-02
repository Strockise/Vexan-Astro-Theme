import type { Core } from '@strapi/strapi';
import { seedDemoContent } from './seed';

const PUBLIC_READ = ['api::blog.blog', 'api::project.project', 'api::service.service'];

/** Let the Astro site read published Blog / Project / Service entries without a token. */
async function grantPublicRead(strapi: Core.Strapi) {
  const role = await strapi.db.query('plugin::users-permissions.role').findOne({ where: { type: 'public' } });
  if (!role) return;
  for (const uid of PUBLIC_READ) {
    for (const action of ['find', 'findOne']) {
      const name = `${uid}.${action}`;
      const exists = await strapi.db.query('plugin::users-permissions.permission').findOne({ where: { action: name, role: role.id } });
      if (!exists) {
        await strapi.db.query('plugin::users-permissions.permission').create({ data: { action: name, role: role.id } });
      }
    }
  }
}

export default {
  register() {},

  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    await grantPublicRead(strapi);
    // Imports the theme's demo content on first start (skipped when entries already exist).
    // Disable with SEED_DEMO_CONTENT=false in strapi/.env.
    if (process.env.SEED_DEMO_CONTENT !== 'false') {
      await seedDemoContent(strapi);
    }
  },
};
