// ============================================================================
// Shop PrintFast — data model for the shop site.
//
// These pages faithfully port the content + imagery of the legacy print-fast.com
// storefront (postcards, mailers, print products, print services and company
// pages) into the modern marketing theme. Every page lives in the shop-website
// app (shop-website/src/pages/) and is rendered through ShopLayout.
//
// `source` records the original print-fast.com path each page was ported from.
// ============================================================================

import { originFor } from '../config/sites';

/**
 * Path prefix for shop routes *within* the shop app. The shop owns its own
 * domain now, so its pages sit at the root — set this to e.g. '/shop' if the
 * shop ever needs to be mounted under a sub-path again (also set the matching
 * `base` in shop-website/astro.config.mjs).
 */
export const SHOP_PATH_PREFIX = '';

/**
 * Everything that goes in front of a shop path.
 * Empty inside the shop app (relative links); the shop's absolute origin when
 * linking in from the marketing site.
 */
export const SHOP_BASE = `${originFor('shop')}${SHOP_PATH_PREFIX}`;

export interface ShopPage {
  slug: string;            // route segment ('' = shop home / index)
  label: string;          // human label used in nav, cards, breadcrumbs
  blurb: string;          // one-line description for directory cards
  icon: string;           // Font Awesome solid icon class (e.g. 'fa-envelope')
  source: string;         // original print-fast.com path (for reference/parity)
}

export interface ShopGroup {
  id: string;
  title: string;
  icon: string;
  description: string;
  pages: ShopPage[];
}

// Convenience: build a full route from a slug ('' -> the shop home).
// Inside the shop app this yields '/letters/'; from the marketing site it
// yields 'https://shop.print-fast.com/letters/'.
export const shopHref = (slug: string) =>
  slug ? `${SHOP_BASE}/${slug}/` : `${SHOP_BASE}/`;

/**
 * The customer-facing storefront app. Ordering and account sign-in live off-site,
 * so the shop sub-nav links out to it in a new tab.
 */
export const SHOP_LOGIN_URL = 'https://www.shop-app.print-fast.com/user_registration.php';

/** Same as `shopHref` but always relative — for routes generated inside the shop app. */
export const shopPath = (slug: string) =>
  slug ? `${SHOP_PATH_PREFIX}/${slug}/` : `${SHOP_PATH_PREFIX}/`;

export const SHOP_HOME: ShopPage = {
  slug: '',
  label: 'Shop PrintFast',
  blurb: 'Direct mail, print products and marketing services for the home-service professional.',
  icon: 'fa-store',
  source: '/',
};

export const SHOP_GROUPS: ShopGroup[] = [
  {
    id: 'postcards-mailers',
    title: 'Postcards & Mailers',
    icon: 'fa-envelopes-bulk',
    description: 'Jumbo postcards and personalized mailers that put your brand in the homeowner’s hands.',
    pages: [
      { slug: 'printfast-postcards', label: 'All Postcards', blurb: 'Jumbo 6"×11" postcards that stand out in the mailbox and build brand awareness.', icon: 'fa-address-card', source: '/printfast-postcards.html' },
      { slug: 'radius-postcards', label: 'Radius Postcards', blurb: 'Spread the word around every job with targeted neighborhood radius mailings.', icon: 'fa-location-crosshairs', source: '/radiuspostcards.html' },
      { slug: 'seasonal-postcards', label: 'Seasonal Postcards', blurb: 'VDP-enabled seasonal designs that keep you top of mind all year long.', icon: 'fa-snowflake', source: '/seasonal-postcards-222.html' },
      { slug: 'service-request-postcards', label: 'Service Request Postcards', blurb: 'Service reminders for existing clients and prospecting for new ones.', icon: 'fa-screwdriver-wrench', source: '/servicerequestpostcards.html' },
      { slug: 'thank-you-postcards', label: 'Thank You Postcards', blurb: 'Simple, low-cost, personalized thank-you cards for your homeowners.', icon: 'fa-heart', source: '/thank-you-postcards-page.html' },
      { slug: 'letters', label: 'Letters', blurb: 'Personalized letters that deliver a more formal, one-to-one message.', icon: 'fa-envelope-open-text', source: '/letters.html' },
      { slug: 'referral-mailers', label: 'Referral Mailers', blurb: 'Turn happy customers into your best salespeople with referral mailers.', icon: 'fa-user-group', source: '/referral-mailers.html' },
      { slug: 'thank-you-mailers', label: 'Thank You Mailers', blurb: 'Show appreciation and reinforce loyalty with personalized thank-you mailers.', icon: 'fa-hand-holding-heart', source: '/thank-you-mailers.html' },
      { slug: 'membership-mailings', label: 'Membership Mailings', blurb: 'Keep membership and maintenance-plan customers engaged and renewing.', icon: 'fa-id-badge', source: '/membership-mailings.html' },
    ],
  },
  {
    id: 'products',
    title: 'Print Products',
    icon: 'fa-boxes-stacked',
    description: 'A full catalog of print marketing products for the home-service professional.',
    pages: [
      { slug: 'all-products', label: 'All PrintFast Products', blurb: 'Browse the full lineup of 100+ marketing products in one place.', icon: 'fa-grip', source: '/all-products.html' },
      { slug: 'products-retailer', label: 'Products Overview', blurb: 'An overview of PrintFast marketing products for retail partners.', icon: 'fa-tags', source: '/products-retailer.html' },
      { slug: 'ceow-products', label: 'Membership Welcome Packets', blurb: 'Welcome new members with a custom printed Welcome Member Packet.', icon: 'fa-layer-group', source: '/ceow_products.html' },
      { slug: 'door-hangers', label: 'Door Hangers', blurb: 'High-impact door hangers that land your offer right on the doorknob.', icon: 'fa-door-open', source: '/door-hangers-217.html' },
      { slug: 'homeowner-experience-packs', label: 'Homeowner Experience Packs', blurb: 'Leave-behind packs that turn every service call into a lasting impression.', icon: 'fa-box-open', source: '/homeowner-experience-packs.html' },
      { slug: 'newsletters-new', label: 'Newsletters', blurb: 'Professionally written, editable newsletters that nurture your customer list.', icon: 'fa-newspaper', source: '/newsletters-new.html' },
      { slug: 'recruiting-cards', label: 'Recruiting Cards', blurb: 'Recruit skilled technicians with mailers that sell your company as an employer.', icon: 'fa-user-plus', source: '/recruitingcards.html' },
      { slug: 'stickers', label: 'Stickers', blurb: 'Branded stickers and labels that keep your name on every job.', icon: 'fa-note-sticky', source: '/stickers-223.html' },
      { slug: 'yard-signs', label: 'Yard Signs', blurb: 'Durable yard signs that turn every completed job into a local billboard.', icon: 'fa-sign-hanging', source: '/yard-signs-page.html' },
    ],
  },
  {
    id: 'services',
    title: 'Services & Solutions',
    icon: 'fa-briefcase',
    description: 'Design, printing and marketing services that do the heavy lifting for you.',
    pages: [
      { slug: 'direct-mail-plus', label: 'Direct Mail Plus', blurb: 'Direct mail paired with digital retargeting so you stay everywhere they look.', icon: 'fa-tower-broadcast', source: '/direct-mail-plus.html' },
      { slug: 'direct-mail-page', label: 'Direct Mail', blurb: 'Targeted, done-for-you direct mail campaigns built to generate calls.', icon: 'fa-envelope', source: '/direct-mail-page.html' },
      { slug: 'creative-design', label: 'Creative Design', blurb: 'Professional design that makes every piece look unmistakably like you.', icon: 'fa-palette', source: '/creative-design-page.html' },
      { slug: 'full-service-printing', label: 'Full Service Printing', blurb: 'End-to-end printing — design, print, and mail handled under one roof.', icon: 'fa-print', source: '/full_service_printing.html' },
      { slug: 'thank-you-programs', label: 'Thank You Programs', blurb: 'Automated thank-you programs that build loyalty and repeat business.', icon: 'fa-gift', source: '/thank-you-programs-232.html' },
      { slug: 'web-design', label: 'Website Services', blurb: 'Websites for home-service providers, built to convert and rank.', icon: 'fa-globe', source: '/web_design.html' },
      { slug: 'mailing-lists', label: 'Mailing Lists', blurb: 'Accurate, targeted mailing lists so every piece reaches the right homeowner.', icon: 'fa-list-check', source: '/mailing-lists.html' },
      { slug: 'free-digital-review', label: 'Free Digital Review', blurb: 'A no-cost review of your online presence with clear next steps.', icon: 'fa-magnifying-glass-chart', source: '/free-digital-review.html' },
    ],
  },
  {
    id: 'company',
    title: 'Company',
    icon: 'fa-building',
    description: 'Who we are, who we serve, and the promises we stand behind.',
    pages: [
      { slug: 'who-we-serve', label: 'Who We Serve', blurb: 'The home-service trades and businesses we proudly support.', icon: 'fa-handshake-angle', source: '/who_we_serve.html' },
      { slug: 'lets-move-forward-together', label: 'Let’s Move Forward Together', blurb: 'How we partner with you to grow your business, step by step.', icon: 'fa-arrow-trend-up', source: '/lets_move_forward_together.html' },
      { slug: 'satisfaction-guarantee', label: 'Satisfaction Guarantee', blurb: 'The guarantee that stands behind every PrintFast order.', icon: 'fa-shield-halved', source: '/satisfaction_guarantee.html' },
      { slug: 'our-pledge-of-service-excellence', label: 'Our Pledge of Service Excellence', blurb: 'Our commitment to service excellence on every project.', icon: 'fa-award', source: '/our_pledge_of_service_excellence.html' },
      { slug: 'faqs', label: 'FAQs', blurb: 'Answers to the questions we hear most from home-service pros.', icon: 'fa-circle-question', source: '/faqs.html' },
      { slug: 'blog', label: 'Blog', blurb: 'Marketing ideas and insights for home-service businesses.', icon: 'fa-pen-nib', source: '/blog.html' },
    ],
  },
  {
    id: 'support',
    title: 'Support',
    icon: 'fa-headset',
    description: 'Upload artwork, review our terms, and get in touch with our team.',
    pages: [
      { slug: 'upload-your-artwork', label: 'Upload Your Files', blurb: 'Send us your artwork and print-ready files securely.', icon: 'fa-cloud-arrow-up', source: '/upload-your-artwork.html' },
      { slug: 'terms-of-use', label: 'Terms & Conditions', blurb: 'The terms and conditions that govern use of PrintFast services.', icon: 'fa-file-contract', source: '/terms-of-use.html' },
      { slug: 'contact-us', label: 'Contact Us', blurb: 'Reach the PrintFast team — we’re here Mon–Fri, 8 AM–5 PM ET.', icon: 'fa-paper-plane', source: '/contact_us.html' },
    ],
  },
];

// Flat list of every shop page (excluding the home) — used for the sitemap.
export const SHOP_PAGES: ShopPage[] = SHOP_GROUPS.flatMap((g) => g.pages);

// Compact top-of-page sub-nav shown on every shop page (one entry per group,
// linking to that group's section on the shop home directory).
export const SHOP_NAV: { label: string; href: string; icon: string }[] = [
  { label: 'Shop Home', href: shopHref(''), icon: 'fa-store' },
  ...SHOP_GROUPS.map((g) => ({ label: g.title, href: `${shopHref('')}#${g.id}`, icon: g.icon })),
];

// Look up which group a slug belongs to (for breadcrumbs).
export const findShopGroup = (slug: string): ShopGroup | undefined =>
  SHOP_GROUPS.find((g) => g.pages.some((p) => p.slug === slug));
