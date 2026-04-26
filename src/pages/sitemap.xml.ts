import type { APIRoute } from 'astro';
import { SITE } from '@data/site';

// Serves /sitemap.xml as a sitemap index pointing to the
// auto-generated sitemap files from @astrojs/sitemap.
// This gives us a clean, conventional path while still using the
// integration's URL discovery and chunking.
export const GET: APIRoute = () => {
  const base = SITE.url.replace(/\/$/, '');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${base}/sitemap-0.xml</loc>
  </sitemap>
</sitemapindex>`;
  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
