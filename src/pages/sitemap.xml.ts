import type { APIRoute } from 'astro';
import { SITE } from '@data/site';

const pages = [
  '/',
  '/social-media-marketing/',
  '/email-marketing/',
  '/website-creation/',
  '/search-engine-optimization/',
  '/pay-per-click-advertising/',
  '/who-we-are/',
  '/contact-us/',
  '/privacy-policy/',
  '/terms-of-use/',
  '/sitemap/',
];

const escapeXml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

export const GET: APIRoute = ({ url, site }) => {
  const configuredSite = site?.toString() ?? SITE.url;
  const base = ['localhost', '127.0.0.1'].includes(url.hostname)
    ? url.origin
    : configuredSite.replace(/\/$/, '');

  const urls = pages
    .map((path) => `  <url>\n    <loc>${escapeXml(new URL(path, base).toString())}</loc>\n  </url>`)
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
