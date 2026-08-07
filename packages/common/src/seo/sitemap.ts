// ============================================================================
// Shared XML sitemap builder.
//
// Each site owns its own /sitemap.xml route and passes only the paths that
// belong to that origin — the marketing site never advertises shop URLs and
// vice versa, which is what search engines expect once the sites are split.
// ============================================================================

const escapeXml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

export interface SitemapOptions {
  /** Paths relative to the site root, e.g. '/contact-us/'. Absolute URLs are passed through. */
  paths: string[];
  /** The request URL — lets localhost builds emit localhost links. */
  url: URL;
  /** `site` from the Astro config. */
  site?: URL | string;
  /** Fallback when neither `site` nor a local host is available. */
  fallbackOrigin: string;
}

export const buildSitemapXml = ({ paths, url, site, fallbackOrigin }: SitemapOptions): string => {
  const configured = site?.toString() ?? fallbackOrigin;
  const base = ['localhost', '127.0.0.1'].includes(url.hostname)
    ? url.origin
    : configured.replace(/\/+$/, '');

  // De-duplicate while preserving author order.
  const seen = new Set<string>();
  const entries: string[] = [];

  for (const path of paths) {
    const loc = new URL(path, base).toString();
    if (seen.has(loc)) continue;
    seen.add(loc);
    entries.push(`  <url>\n    <loc>${escapeXml(loc)}</loc>\n  </url>`);
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.join('\n')}
</urlset>`;
};

export const sitemapResponse = (options: SitemapOptions): Response =>
  new Response(buildSitemapXml(options), {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
