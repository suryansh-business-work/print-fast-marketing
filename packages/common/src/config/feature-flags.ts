// ============================================================================
// Page-level feature flags.
//
// Each page that renders a pricing table / plan grid reads its own entry here.
// Flip a single entry to `true` to bring that page's pricing back (along with
// the pricing-related CTAs — "See pricing", "View plans", "Get Pricing", the
// pay-for-your-plan checkout card — that go with it).
// ============================================================================

export const PRICING_VISIBLE = {
  // main-website (print-fast.com)
  'main/complete-social-media-plan': false,
  'main/contact-us': false,
  'main/direct-mail-and-digital-combined': false,
  'main/email-marketing': false,
  'main/pay-per-click-advertising': false,
  'main/social-media-marketing': false,
  'main/website-creation': false,

  // shop-website (shop.print-fast.com)
  'shop/creative-design': false,
  'shop/web-design': false,
} satisfies Record<string, boolean>;

export type PricingPage = keyof typeof PRICING_VISIBLE;

export const showPricing = (page: PricingPage): boolean => PRICING_VISIBLE[page];
