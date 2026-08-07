// ============================================================================
// Client-side search index.
//
// Each site indexes its own pages first, then the other site's top-level pages
// as absolute cross-origin links — so the dialog keeps working as one search
// box across the split without either site 404-ing on the other's routes.
// ============================================================================

import { SITE_ID, mainHref } from '../config/sites';
import { SHOP_HOME, SHOP_PAGES, shopHref, shopPath } from './shop';

export interface SearchEntry {
  title: string;
  href: string;
  /** Space-separated keywords, lower-case. */
  kw: string;
}

const MARKETING_PAGES: SearchEntry[] = [
  { title: 'Home', href: '/', kw: 'home digital marketing agency printfast home-service' },
  { title: 'Social Media Marketing', href: '/social-media-marketing/', kw: 'social media facebook instagram tiktok linkedin youtube content paid social smm' },
  { title: 'Email Marketing', href: '/email-marketing/', kw: 'email newsletters automations sms can-spam lifecycle' },
  { title: 'Website Creation', href: '/website-creation/', kw: 'website web design development ada accessibility core web vitals build site' },
  { title: 'Search Engine Optimization (SEO)', href: '/search-engine-optimization/', kw: 'seo search engine optimization local national ai search google bing' },
  { title: 'Pay-Per-Click Advertising (PPC)', href: '/pay-per-click-advertising/', kw: 'ppc pay per click google ads lsa local services ads meta microsoft ads' },
  { title: 'Who We Are', href: '/who-we-are/', kw: 'about team company history bill mcgowan kim burke mark luffy' },
  { title: 'Contact Us', href: '/contact-us/', kw: 'contact phone email address quote proposal middlesex nj' },
];

const marketingEntries: SearchEntry[] = MARKETING_PAGES.map((entry) => ({
  ...entry,
  href: mainHref(entry.href),
}));

const shopEntries: SearchEntry[] = [
  {
    title: SHOP_HOME.label,
    href: SITE_ID === 'shop' ? shopPath('') : shopHref(''),
    kw: `shop store print products ${SHOP_HOME.blurb}`.toLowerCase(),
  },
  ...SHOP_PAGES.map((page) => ({
    title: page.label,
    href: SITE_ID === 'shop' ? shopPath(page.slug) : shopHref(page.slug),
    kw: `${page.label} ${page.slug.replace(/-/g, ' ')} ${page.blurb}`.toLowerCase(),
  })),
];

/** Pages searchable from the site currently being built, own pages first. */
export const SEARCH_INDEX: SearchEntry[] =
  SITE_ID === 'shop' ? [...shopEntries, ...marketingEntries] : marketingEntries;
