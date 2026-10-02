import { marked } from 'marked';

/** Normalise a pathname so "/about/" and "/about" compare equal. */
export function normalizePath(path: string): string {
  if (!path) return '/';
  const clean = path.split(/[?#]/)[0].replace(/\/+$/, '');
  return clean === '' ? '/' : clean;
}

/** Webflow marks every link that points at the current page with `w--current`. */
export function isCurrent(currentPath: string, href: string): boolean {
  if (!href || href.startsWith('http') || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return false;
  return normalizePath(currentPath) === normalizePath(href);
}

/** Render CMS Markdown (or legacy HTML) to HTML for `.w-richtext` blocks. */
export function renderRichText(source?: string | null): string {
  if (!source) return '';
  return marked.parse(source, { async: false, gfm: true }) as string;
}

/** Strip characters that would break a `tel:` link. */
export function telHref(phone: string): string {
  return 'tel:' + phone.replace(/[^\d+]/g, '');
}

/** Format an ISO date like Webflow's "MMMM D, YYYY" (e.g. "January 12, 2026"), in UTC. */
export function formatDate(iso: string, locale = 'en-US'): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(locale, { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
}
