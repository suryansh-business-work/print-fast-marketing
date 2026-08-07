import type { APIRoute } from 'astro';
import { SITE } from '@data/site';
import { sitemapResponse } from '@seo/sitemap';

// Marketing site only. Shop URLs live on shop.print-fast.com and are listed in
// that site's own sitemap — a sitemap must not advertise another origin.
const pages = [
  '/',
  '/social-media-marketing/',
  '/direct-mail-plus/',
  '/direct-mail-and-digital-combined/',
  '/email-marketing/',
  '/website-creation/',
  '/search-engine-optimization/',
  '/pay-per-click-advertising/',
  '/complete-social-media-plan/',
  '/who-we-are/',
  '/contact-us/',
  '/checkout/',
  '/privacy-policy/',
  '/terms-of-use/',
  '/sitemap/',
];

export const GET: APIRoute = ({ url, site }) =>
  sitemapResponse({ paths: pages, url, site, fallbackOrigin: SITE.url });
