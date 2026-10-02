/**
 * Content types used by the pages. They mirror the Strapi content types in
 * `strapi/src/api/{blog,project,service}/content-types/*\/schema.json`.
 * Media fields are resolved to absolute/root-relative URL strings by `src/lib/cms.ts`.
 */

export interface Blog {
  title: string;
  /** Title used on the home page blog cards. */
  homeTitle: string;
  slug: string;
  summary: string;
  /** Summary used on the home page blog cards. */
  homeSummary: string;
  readTime: string;
  /** ISO date string */
  date: string;
  image: string;
  mainImage: string;
  thumbnailImage: string;
  detailsTitle: string;
  detailsSummary: string;
  /** Rich text: Markdown or HTML */
  content: string;
  order: number;
}

export interface Project {
  title: string;
  slug: string;
  mainImage: string;
  thumbnailImage: string;
  year: string;
  detailsTitle: string;
  detailsSummary: string;
  industry: string;
  service: string;
  duration: string;
  role: string;
  gallery: string[];
  overview: string;
  challenge: string;
  goals: string;
  featureImage: string;
  clientQuote: string;
  clientName: string;
  clientPosition: string;
  clientAvatar: string;
  order: number;
}

export interface Service {
  title: string;
  slug: string;
  cardNumber: string;
  summary: string;
  image: string;
  arrowIcon: string;
  thumbnailImage: string;
  gallery: string[];
  detailsTitle: string;
  summaryTwo: string;
  quickStats: string;
  overview: string;
  deliverables: string;
  order: number;
}
