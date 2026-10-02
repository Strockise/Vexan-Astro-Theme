/**
 * CMS data access (server-side only: import this from .astro frontmatter, never from a client <script>).
 *
 * - When STRAPI_URL is set, content is fetched from Strapi 5 at build time.
 * - When it is not set, the bundled demo content in src/data/*.json is used, so the theme
 *   builds and runs out of the box. The same JSON is what `npm run strapi:seed` imports.
 */
import type { Blog, Project, Service } from './types';
import blogsData from '../data/blogs.json';
import projectsData from '../data/projects.json';
import servicesData from '../data/services.json';

const STRAPI_URL = import.meta.env.STRAPI_URL as string | undefined;
const STRAPI_TOKEN = import.meta.env.STRAPI_API_TOKEN as string | undefined;

type StrapiMedia = { url: string } | null | undefined;
type Raw = Record<string, unknown>;

const MEDIA_FIELDS = ['image', 'mainImage', 'thumbnailImage', 'featureImage', 'clientAvatar', 'arrowIcon'];
const MEDIA_LIST_FIELDS = ['gallery'];
const RICH_FIELDS = ['content', 'overview', 'challenge', 'goals', 'quickStats', 'deliverables'];

function mediaUrl(m: StrapiMedia): string {
  if (!m?.url) return '';
  return m.url.startsWith('http') ? m.url : new URL(m.url, STRAPI_URL).toString();
}

/** Make relative /uploads/... paths inside rich text absolute so they load from Strapi. */
function absolutizeRichText(html: string): string {
  if (!STRAPI_URL || !html) return html;
  return html.replace(/(src|href)="(\/uploads\/[^"]+)"/g, (_, attr, p) => `${attr}="${new URL(p, STRAPI_URL).toString()}"`);
}

function normalize<T>(entry: Raw): T {
  const out: Raw = { ...entry };
  for (const f of MEDIA_FIELDS) if (f in out) out[f] = mediaUrl(out[f] as StrapiMedia);
  for (const f of MEDIA_LIST_FIELDS) if (f in out) out[f] = ((out[f] as StrapiMedia[]) || []).map(mediaUrl);
  for (const f of RICH_FIELDS) if (typeof out[f] === 'string') out[f] = absolutizeRichText(out[f] as string);
  return out as T;
}

async function fetchCollection<T>(collection: string): Promise<T[]> {
  const out: T[] = [];
  let page = 1;
  let pageCount = 1;
  do {
    const url = new URL(`/api/${collection}`, STRAPI_URL);
    url.searchParams.set('populate', '*');
    url.searchParams.set('sort', 'order:asc');
    url.searchParams.set('pagination[page]', String(page));
    url.searchParams.set('pagination[pageSize]', '100');
    const res = await fetch(url, { headers: STRAPI_TOKEN ? { Authorization: `Bearer ${STRAPI_TOKEN}` } : {} });
    if (!res.ok) {
      throw new Error(`Strapi ${res.status} on ${url.pathname}: ${await res.text()}\nCheck STRAPI_URL / STRAPI_API_TOKEN in .env (see THEME-CUSTOMIZATION.md → CMS).`);
    }
    const json = (await res.json()) as { data: Raw[]; meta: { pagination: { pageCount: number } } };
    out.push(...json.data.map((e) => normalize<T>(e)));
    pageCount = json.meta.pagination.pageCount;
  } while (++page <= pageCount);
  return out;
}

const cache = new Map<string, Promise<unknown[]>>();

function load<T extends { order: number }>(collection: string, fallback: T[]): Promise<T[]> {
  if (!cache.has(collection)) {
    const p = STRAPI_URL
      ? fetchCollection<T>(collection)
      : Promise.resolve([...fallback].sort((a, b) => a.order - b.order));
    cache.set(collection, p);
  }
  return cache.get(collection) as Promise<T[]>;
}

/** All blog posts, in display order. */
export const getBlogs = () => load<Blog>('blogs', blogsData as Blog[]);
/** All projects, in display order. */
export const getProjects = () => load<Project>('projects', projectsData as Project[]);
/** All services, in display order. */
export const getServices = () => load<Service>('services', servicesData as Service[]);
