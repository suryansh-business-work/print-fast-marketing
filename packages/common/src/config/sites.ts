// ============================================================================
// Cross-site wiring for the PrintFast platform.
//
// The marketing site, the shop site and the ROAS app each run on their own
// origin. Shared components link across those boundaries, so a link is either
// a bare path (same app) or an absolute URL (different app). Everything below
// derives from `PUBLIC_SITE_ID`, which each Astro app sets in its own config —
// no component ever needs to know which site it is rendering inside.
//
// Override any origin per environment with the matching PUBLIC_* variable
// (see .env.example at the repo root).
// ============================================================================

export type SiteId = 'main' | 'shop';

const env = (import.meta.env ?? {}) as Record<string, string | undefined>;

const trimTrailingSlash = (url: string) => url.replace(/\/+$/, '');

/** Which app this bundle is being built for. Set via `PUBLIC_SITE_ID`. */
export const SITE_ID: SiteId = env.PUBLIC_SITE_ID === 'shop' ? 'shop' : 'main';

/** Public origin of every surface on the platform. */
export const SITE_URLS = {
  main: trimTrailingSlash(env.PUBLIC_MAIN_SITE_URL || 'https://marketing.print-fast.com'),
  shop: trimTrailingSlash(env.PUBLIC_SHOP_SITE_URL || 'https://shop.print-fast.com'),
  roas: trimTrailingSlash(env.PUBLIC_ROAS_APP_URL || 'https://roas.print-fast.com'),
  roasApi: trimTrailingSlash(env.PUBLIC_ROAS_API_URL || 'https://roas-server.print-fast.com'),
} as const;

/** Canonical origin of the app currently being built. */
export const SELF_URL = SITE_URLS[SITE_ID];

/**
 * Prefix to put in front of a path when linking to `target`.
 * Empty string when `target` is the app we are already inside, so same-site
 * links stay relative (and keep working on localhost and preview builds).
 */
export const originFor = (target: SiteId): string => (target === SITE_ID ? '' : SITE_URLS[target]);

/** Link to a page on the marketing site from anywhere. */
export const mainHref = (path = '/'): string => `${originFor('main')}${path}`;

/** Link to the ROAS dashboard (always cross-origin — it is not an Astro app). */
export const roasHref = (path = '/'): string => `${SITE_URLS.roas}${path}`;
