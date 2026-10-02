/**
 * Demo-content seeder.
 *
 * Reads the theme's bundled demo content (../src/data/*.json) and media (../public/cms/*),
 * uploads the media to the Strapi Media Library, then creates and publishes the
 * Blog / Project / Service entries. It is idempotent: entries are matched by slug, and
 * a collection that already contains entries is left untouched.
 */
import type { Core } from '@strapi/strapi';
import fs from 'node:fs';
import path from 'node:path';

type Entry = Record<string, unknown> & { slug: string };

const COLLECTIONS = [
  { uid: 'api::service.service', file: 'services.json' },
  { uid: 'api::project.project', file: 'projects.json' },
  { uid: 'api::blog.blog', file: 'blogs.json' },
] as const;

const MEDIA_FIELDS = ['image', 'mainImage', 'thumbnailImage', 'featureImage', 'clientAvatar', 'arrowIcon'];
const MEDIA_LIST_FIELDS = ['gallery'];
const RICH_FIELDS = ['content', 'overview', 'challenge', 'goals', 'quickStats', 'deliverables'];

const MIME: Record<string, string> = {
  '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml', '.gif': 'image/gif', '.avif': 'image/avif',
};

export async function seedDemoContent(strapi: Core.Strapi) {
  const themeRoot = path.resolve(strapi.dirs.app.root, process.env.SEED_THEME_ROOT ?? '..');
  const dataDir = path.join(themeRoot, 'src', 'data');
  const publicDir = path.join(themeRoot, 'public');
  if (!fs.existsSync(dataDir)) {
    strapi.log.warn(`[seed] ${dataDir} not found: skipping demo content.`);
    return;
  }

  const uploaded = new Map<string, { id: number; url: string }>();

  /** Upload a /cms/... file once and return its Media Library id + url. */
  async function upload(publicPath: string) {
    if (!publicPath) return null;
    if (uploaded.has(publicPath)) return uploaded.get(publicPath)!;
    const filepath = path.join(publicDir, publicPath.replace(/^\//, ''));
    if (!fs.existsSync(filepath)) {
      strapi.log.warn(`[seed] missing media ${filepath}`);
      return null;
    }
    const name = path.basename(filepath);
    // Re-use a file that an earlier (partial) seed already uploaded.
    const existing = await strapi.db.query('plugin::upload.file').findOne({ where: { name } });
    const file =
      existing ??
      (
        await strapi.plugin('upload').service('upload').upload({
          data: { fileInfo: { name, alternativeText: name.replace(/\.\w+$/, '').replace(/-/g, ' ') } },
          files: { filepath, originalFilename: name, mimetype: MIME[path.extname(name).toLowerCase()] ?? 'application/octet-stream', size: fs.statSync(filepath).size },
        })
      )[0];
    const result = { id: file.id as number, url: file.url as string };
    uploaded.set(publicPath, result);
    return result;
  }

  for (const { uid, file } of COLLECTIONS) {
    const docs = strapi.documents(uid as any);
    const count = await docs.count({});
    if (count > 0) continue;

    const entries: Entry[] = JSON.parse(fs.readFileSync(path.join(dataDir, file), 'utf8'));
    strapi.log.info(`[seed] importing ${entries.length} entries into ${uid}…`);

    for (const entry of entries) {
      const data: Record<string, unknown> = { ...entry };
      for (const f of MEDIA_FIELDS) if (f in data) data[f] = (await upload(data[f] as string))?.id ?? null;
      for (const f of MEDIA_LIST_FIELDS) {
        if (!(f in data)) continue;
        const ids = [];
        for (const p of (data[f] as string[]) ?? []) {
          const m = await upload(p);
          if (m) ids.push(m.id);
        }
        data[f] = ids;
      }
      // Images referenced inside rich text: upload them and point the HTML at the Media Library.
      for (const f of RICH_FIELDS) {
        if (typeof data[f] !== 'string') continue;
        let html = data[f] as string;
        for (const [, src] of html.matchAll(/src="(\/cms\/[^"]+)"/g)) {
          const m = await upload(src);
          if (m) html = html.split(`"${src}"`).join(`"${m.url}"`);
        }
        data[f] = html;
      }
      await docs.create({ data: data as any, status: 'published' });
    }
    strapi.log.info(`[seed] ${uid} done.`);
  }
}
