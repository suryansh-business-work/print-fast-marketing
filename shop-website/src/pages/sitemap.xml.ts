import type { APIRoute } from 'astro';
import { SITE } from '@data/site';
import { SHOP_PAGES, shopPath } from '@data/shop';
import { sitemapResponse } from '@seo/sitemap';

// Shop site only — every route is derived from the shop data model, so adding
// a product page to @data/shop automatically lists it here.
const pages = [shopPath(''), ...SHOP_PAGES.map((page) => shopPath(page.slug)), '/sitemap/'];

export const GET: APIRoute = ({ url, site }) =>
  sitemapResponse({ paths: pages, url, site, fallbackOrigin: SITE.url });
