// ============================================================================
// Website visibility & growth systems — the 5-tier plan matrix.
//
// Single source of truth shared by /website-creation/ and the shop
// /shop-print-fast/web-design/ page, both of which render it through
// <WebsitePlans />. Update pricing or features here only.
// ============================================================================

export interface WebsiteTier {
  name: string;
  price: string;
  period: string;
  target: string;
  slug: string;
  popular?: boolean;
}

export interface ComparisonGroup {
  group: string;
  rows: { label: string; cells: string[] }[];
}

export const WEBSITE_TIERS: WebsiteTier[] = [
  { name: 'Starter', price: '$895', period: '/mo', target: 'Small crews / first-time advertisers', slug: 'starter' },
  { name: 'Van Visibility System™', price: '$1,395', period: '/mo', target: '1–4 vehicles', slug: 'van-visibility-system' },
  { name: 'Growth Acceleration System™', price: '$3,000', period: '/mo', target: '5–15 vehicles', slug: 'growth-acceleration-system', popular: true },
  { name: 'Market Domination System™', price: '$7,000', period: '/mo', target: '15–100 vehicles', slug: 'market-domination-system' },
  { name: 'Enterprise Territory System™', price: 'Custom', period: '', target: 'Enterprise / PE groups', slug: 'enterprise-territory-system' },
];

// Comparison matrix. Each cell: '✔' = included, '-' = not included, any other string renders as text.
// Columns map 1:1 to `tiers` above (Starter, Van Visibility, Growth Acceleration, Market Domination, Enterprise Territory).
export const WEBSITE_COMPARISON: ComparisonGroup[] = [
  {
    group: 'Core Visibility & Growth',
    rows: [
      { label: 'Recommended markets', cells: ['Small to mid markets', 'Small to mid markets', 'Competitive local markets', 'Major metro expansion', 'Multi-market / national'] },
      { label: 'Monthly boost budget (included)', cells: ['$295', '$295', '$500', '$1,000', 'Custom scalable'] },
      { label: 'Google Business Profile optimization', cells: ['✔', '✔', '✔', '✔', '✔'] },
      { label: 'AI search visibility optimization', cells: ['✔', '✔', '✔', '✔', '✔'] },
      { label: 'Local SEO optimization', cells: ['✔', '✔', '✔', '✔', '✔'] },
      { label: 'Directory synchronization', cells: ['✔', '✔', '✔', '✔', '✔'] },
      { label: 'Review generation system', cells: ['✔', '✔', '✔', '✔', '✔'] },
      { label: 'Review response assistance', cells: ['✔', '✔', '✔', '✔', '✔'] },
      { label: 'Monthly visibility reporting', cells: ['✔', '✔', '✔', '✔', '✔'] },
      { label: 'Social media visibility', cells: ['8 posts', '12 posts', '20 posts', '30 posts', 'Custom'] },
      { label: 'AI-assisted content creation', cells: ['✔', '✔', '✔', '✔', '✔'] },
      { label: 'Seasonal marketing campaigns', cells: ['✔', '✔', '✔', '✔', '✔'] },
      { label: 'Retargeting setup', cells: ['-', 'Basic', 'Advanced', 'Advanced', 'Enterprise'] },
      { label: 'Call tracking', cells: ['-', '-', '✔', '✔', '✔'] },
      { label: 'Lead attribution tracking', cells: ['-', '-', '✔', '✔', '✔'] },
      { label: 'Email marketing campaigns', cells: ['-', '-', '✔', '✔', '✔'] },
      { label: 'SMS follow-up campaigns', cells: ['-', '-', '✔', '✔', '✔'] },
      { label: 'CRM integration assistance', cells: ['-', '-', '✔', '✔', '✔'] },
      { label: 'Neighborhood market penetration', cells: ['-', '-', '✔', '✔', '✔'] },
      { label: 'Competitor visibility monitoring', cells: ['Basic', 'Basic', '✔', '✔', '✔'] },
      { label: 'Video content repurposing', cells: ['-', '-', '✔', '✔', '✔'] },
      { label: 'Recruitment marketing campaigns', cells: ['-', '-', '✔', '✔', '✔'] },
      { label: 'Advanced reporting dashboards', cells: ['-', '-', '-', '✔', '✔'] },
      { label: 'Heatmap tracking', cells: ['-', '-', '-', '✔', '✔'] },
      { label: 'Multi-location SEO', cells: ['-', '-', '-', '✔', '✔'] },
      { label: 'Territory expansion strategy', cells: ['-', '-', '-', '✔', '✔'] },
      { label: 'AI chat integration assistance', cells: ['-', '-', '-', '✔', '✔'] },
      { label: 'Booking automation assistance', cells: ['-', '-', '-', '✔', '✔'] },
      { label: 'LSA optimization guidance', cells: ['-', '-', '-', '✔', '✔'] },
      { label: 'Executive strategy sessions', cells: ['-', '-', 'Quarterly', 'Quarterly', 'Monthly'] },
      { label: 'Cross-brand analytics', cells: ['-', '-', '-', '-', '✔'] },
      { label: 'Franchise visibility systems', cells: ['-', '-', '-', '-', '✔'] },
      { label: 'Centralized reputation management', cells: ['-', '-', '-', '-', '✔'] },
      { label: 'Enterprise automation systems', cells: ['-', '-', '-', '-', '✔'] },
      { label: 'Acquisition rollout campaigns', cells: ['-', '-', '-', '-', '✔'] },
      { label: 'Dedicated strategic account team', cells: ['-', '-', '-', '✔', '✔'] },
      { label: 'Direct mail integration', cells: ['Optional', 'Optional', '✔', '✔', '✔'] },
      { label: 'Voice search optimization', cells: ['✔', '✔', '✔', '✔', '✔'] },
      { label: 'AI citation optimization', cells: ['-', '-', '✔', '✔', '✔'] },
      { label: 'Service area expansion', cells: ['-', '-', '✔', '✔', '✔'] },
      { label: 'Additional boost budget upsell', cells: ['-', 'Add up to $1,000 before extra management fees', 'Add up to $2,500 before extra management fees', 'Add up to $5,000 before extra management fees', 'Custom scalable enterprise media buying'] },
    ],
  },
  {
    group: 'AI Search, AEO, GEO & LLM Visibility',
    rows: [
      { label: 'AI visibility baseline audit', cells: ['Included', 'Included', 'Included', 'Included', 'Included'] },
      { label: 'Prompt tracking library', cells: ['10 prompts quarterly', '25 prompts monthly', '50–100 prompts monthly', 'Custom multi-market library', 'Custom by brand, market, service & competitor'] },
      { label: 'AI Answer Engine Optimization (AEO)', cells: ['Basic FAQ & service-answer structure', 'Included on core pages', 'Advanced across service & city pages', 'Advanced by market & category', 'Enterprise by brand, location & territory'] },
      { label: 'Generative Engine Optimization (GEO)', cells: ['Foundational site signals', 'Included with content & schema', 'Advanced content, citation & authority', 'Multi-market GEO system', 'Enterprise GEO governance & rollout'] },
      { label: 'LLM entity optimization', cells: ['Name, services, locations & proof cleaned up', 'Entity consistency across site, GBP, directories & social', 'Advanced entity mapping by service, city, brand & tech proof', 'Regional entity architecture', 'Enterprise entity system by brand, acquisition & territory'] },
      { label: 'AI citation readiness', cells: ['Basic service proof & FAQ cleanup', 'Structured citations, sources & answer-ready pages', 'Advanced source-worthy content & third-party proof', 'Market-level citation strategy', 'Enterprise citation governance'] },
      { label: 'AI overview content refresh', cells: ['Quarterly priority page refresh', 'Monthly content refresh', '2–4 refreshes monthly', '4–8 refreshes monthly', 'Custom refresh calendar'] },
      { label: 'AI search competitor gap report', cells: ['Quarterly', 'Monthly', 'Monthly by priority service', 'Monthly by territory', 'Custom executive reporting'] },
      { label: 'AI risk monitoring', cells: ['Basic brand answer check', 'Monthly incorrect-answer check', 'Monthly brand, service & competitor scan', 'Advanced risk & misinformation monitoring', 'Enterprise protocol'] },
      { label: 'Schema expansion for AI search', cells: ['Basic LocalBusiness & Service review', 'LocalBusiness, Service, FAQ, Review where valid', 'Advanced multi-service schema expansion', 'Multi-location schema governance', 'Enterprise schema governance'] },
      { label: 'Conversational search FAQ expansion', cells: ['5 questions / quarter', '10 questions / month', '25 questions / month', '50 questions / month', 'Custom by brand & market'] },
      { label: 'People, proof & E-E-A-T signals', cells: ['Basic about/team proof cleanup', 'Owner, team, licenses & service proof', 'Advanced proof system across pages & posts', 'Territory proof & case-study system', 'Enterprise credibility framework'] },
      { label: 'AI visibility tool cost handling', cells: ['Not included unless approved', 'One small tool budget may pass through', 'Tool budget passed through or bundled', 'Advanced tool stack by agreement', 'Enterprise tool stack by agreement'] },
    ],
  },
  {
    group: 'Website, Content & Conversion',
    rows: [
      { label: 'Website care & security coordination', cells: ['Basic updates if hosted/managed', 'Included care coordination', 'Advanced care & performance monitoring', 'Priority care & staging coordination', 'Enterprise governance'] },
      { label: 'Core Web Vitals & speed review', cells: ['Quarterly', 'Monthly', 'Monthly with priority fixes', 'Advanced by template & landing page', 'Enterprise monitoring'] },
      { label: 'Conversion path review', cells: ['Quarterly', 'Monthly', 'Monthly with landing-page recommendations', 'Advanced testing roadmap', 'Enterprise conversion governance'] },
      { label: 'Service page buildout', cells: ['Optional add-on', '1–2 pages / month', '2–4 pages / month', '4–8 pages / month', 'Custom'] },
      { label: 'City & town page buildout', cells: ['Optional add-on', '1–2 pages / month when justified', '2–6 pages / month when justified', '6–12 pages / month when justified', 'Custom rollout, no thin pages'] },
      { label: 'Offer & promotion landing pages', cells: ['Optional', 'Quarterly', 'Monthly', '2–4 monthly', 'Custom campaign library'] },
      { label: 'Financing, rebates & specials pages', cells: ['Basic cleanup', 'Included when relevant', 'Advanced seasonal updates', 'Market-specific updates', 'Custom by brand & utility territory'] },
      { label: 'Trust asset development', cells: ['Basic review & credential placement', 'Reviews, badges, license, financing & warranty proof', 'Case studies & job proof system', 'Market proof library', 'Enterprise proof governance'] },
    ],
  },
  {
    group: 'CRM, Automation & Customer Lifecycle',
    rows: [
      { label: 'Missed-call text-back coordination', cells: ['Optional', 'Platform-dependent setup support', 'Included if platform allows', 'Advanced workflow coordination', 'Enterprise workflow governance'] },
      { label: 'Unsold estimate follow-up', cells: ['Optional', 'Basic campaign', 'Monthly campaign', 'Segmented by service line', 'Enterprise lifecycle library'] },
      { label: 'Maintenance agreement campaigns', cells: ['Optional', 'Basic email campaign', 'Email & SMS coordination', 'Advanced lifecycle campaigns', 'Enterprise lifecycle library'] },
      { label: 'Win-back & reactivation campaigns', cells: ['Optional', 'Quarterly', 'Monthly', 'Segmented monthly', 'Custom by brand, region & trade'] },
      { label: 'Storm, heat-wave & seasonal trigger campaigns', cells: ['Optional', 'Included planning', 'Included campaign support', 'Advanced regional response', 'Enterprise response protocol'] },
    ],
  },
  {
    group: 'Hyperlocal Market Penetration Mailer™',
    rows: [
      { label: 'Purpose', cells: ['-', 'Break into local neighborhoods', 'Expand ZIP code visibility', 'Dominate target territories', 'Multi-market saturation campaigns'] },
      { label: 'Includes', cells: ['-', '2,500 seasonal postcards', '5,000–10,000 postcards', '10,000–25,000+ postcards', 'Enterprise multi-market deployments'] },
      { label: 'Neighborhood targeting', cells: ['-', '✔', '✔', '✔', '✔'] },
      { label: 'Demographic & income targeting', cells: ['-', '✔', '✔', '✔', '✔'] },
      { label: 'Radius & ZIP code targeting', cells: ['-', '✔', '✔', '✔', '✔'] },
      { label: 'Custom direct mail design', cells: ['-', '✔', '✔', '✔', '✔'] },
      { label: 'Full-color printing', cells: ['-', '✔', '✔', '✔', '✔'] },
      { label: 'USPS processing & delivery coordination', cells: ['-', '✔', '✔', '✔', '✔'] },
      { label: 'Integrated digital reinforcement', cells: ['-', 'Basic', 'Advanced', 'Advanced', 'Enterprise'] },
      { label: 'Social feed reinforcement', cells: ['-', '✔', '✔', '✔', '✔'] },
      { label: 'Retargeting coordination', cells: ['-', 'Basic', '✔', '✔', '✔'] },
      { label: 'Seasonal campaign planning', cells: ['-', '✔', '✔', '✔', '✔'] },
      { label: 'Market penetration strategy', cells: ['-', 'Local neighborhood focus', 'ZIP code expansion', 'Regional market domination', 'National territory expansion'] },
      { label: 'Recommended add-on budget', cells: ['-', '$750–$1,500/mo', '$1,500–$4,000/mo', '$5,000–$15,000+/mo', 'Custom enterprise budget'] },
      { label: 'Positioning statement', cells: ['-', 'Own your neighborhood before competitors show up.', 'Dominate your ZIP codes and local service areas.', 'Flood your markets with synchronized visibility.', 'Control regional visibility at enterprise scale.'] },
      { label: 'Direct mail + AI search tie-in', cells: ['-', 'Mailer mirrored on GBP, social, service page & FAQs', 'Mailer tied to local landing page & AI-ready FAQ', 'Mailer + territory pages, retargeting & AI prompt tracking', 'Enterprise mailbox-to-search-to-call reporting'] },
    ],
  },
];
