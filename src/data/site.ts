export interface NavChild {
  label: string;
  href: string;
  description?: string;
  icon?: string; // Font Awesome class
}

export interface NavLink {
  label: string;
  href: string;
  external?: boolean;
  children?: NavChild[];
  featured?: { title: string; description: string; href: string; cta: string };
}

export interface ServiceCard {
  title: string;
  description: string;
  icon: string; // Font Awesome class, e.g. "fa-bullhorn"
  href: string;
}

export const SITE = {
  name: 'Print Fast',
  fullName: 'Print Fast Digital Marketing',
  tagline: 'Performance marketing for U.S. home-service brands',
  description:
    'Print Fast is a U.S. digital marketing agency for home-service and local brands. We deliver social media marketing, email marketing, website creation, search engine optimization (SEO), and pay-per-click (PPC) advertising under one accountable team.',
  url: 'https://www.print-fast.com',
  phone: '800-810-4818',
  phoneHref: 'tel:800-810-4818',
  email: 'info@print-fast.com',
  hours: 'Mon–Fri · 8 AM – 5 PM ET',
  address: 'United States',
  logo: 'https://dqj17tese79do.cloudfront.net/printfast/images/websitelogos/retailer_site_logo776.png',
  defaultOgImage: '/og-default.svg',
  defaultKeywords: [
    'digital marketing agency USA',
    'social media marketing',
    'email marketing services',
    'website design and development',
    'search engine optimization',
    'SEO agency',
    'pay-per-click advertising',
    'PPC management',
    'Google Ads agency',
    'local SEO USA',
    'PrintFast',
  ],
  social: {
    facebook: 'https://facebook.com',
    instagram: 'https://instagram.com',
    linkedin: 'https://linkedin.com',
    youtube: 'https://youtube.com',
    twitter: 'https://twitter.com',
  },
};

export const NAV_LINKS: NavLink[] = [
  { label: 'Home', href: '/' },
  {
    label: 'Services',
    href: '/social-media-marketing/',
    children: [
      {
        label: 'Social Media Marketing',
        href: '/social-media-marketing/',
        description: 'Done-for-you content, posting & paid social across every major network.',
        icon: 'fa-share-nodes',
      },
      {
        label: 'Email Marketing',
        href: '/email-marketing/',
        description: 'Lifecycle automations, newsletters & SMS that drive repeat revenue.',
        icon: 'fa-envelope-open-text',
      },
      {
        label: 'Website Creation',
        href: '/website-creation/',
        description: 'Fast, ADA-ready sites built to convert and rank in U.S. search.',
        icon: 'fa-globe',
      },
      {
        label: 'Search Engine Optimization (SEO)',
        href: '/search-engine-optimization/',
        description: 'Local & national SEO that wins Google, Bing and AI search.',
        icon: 'fa-magnifying-glass-chart',
      },
      {
        label: 'Pay-Per-Click Advertising (PPC)',
        href: '/pay-per-click-advertising/',
        description: 'Google Ads, LSAs and Meta campaigns tied to real lead value.',
        icon: 'fa-bullhorn',
      },
    ],
    featured: {
      title: 'Need a quote?',
      description: 'Tell us about your goals — get a tailored proposal within one business day.',
      href: '/contact-us/',
      cta: 'Request a proposal',
    },
  },
  { label: 'Who We Are', href: '/who-we-are/' },
  { label: 'Contact', href: '/contact-us/' },
];

export const FOOTER_SERVICES: NavLink[] = [
  { label: 'Social Media Marketing', href: '/social-media-marketing/' },
  { label: 'Email Marketing', href: '/email-marketing/' },
  { label: 'Website Creation', href: '/website-creation/' },
  { label: 'Search Engine Optimization', href: '/search-engine-optimization/' },
  { label: 'Pay-Per-Click Advertising', href: '/pay-per-click-advertising/' },
];

export const SERVICES: ServiceCard[] = [
  {
    title: 'Social Media Marketing',
    description:
      'Strategy, content, posting and paid social on Facebook, Instagram, TikTok, LinkedIn and YouTube — built to grow brand and book jobs.',
    icon: 'fa-share-nodes',
    href: '/social-media-marketing/',
  },
  {
    title: 'Email Marketing',
    description:
      'CAN-SPAM-compliant email and SMS programs — newsletters, lifecycle automations and win-back flows that compound customer lifetime value.',
    icon: 'fa-envelope-open-text',
    href: '/email-marketing/',
  },
  {
    title: 'Website Creation',
    description:
      'Fast, mobile-first websites with ADA accessibility, Core Web Vitals and conversion-first design baked in from day one.',
    icon: 'fa-globe',
    href: '/website-creation/',
  },
  {
    title: 'Search Engine Optimization (SEO)',
    description:
      'Local SEO, technical SEO, content and AI-search optimization that puts you on page one when U.S. customers are ready to buy.',
    icon: 'fa-magnifying-glass-chart',
    href: '/search-engine-optimization/',
  },
  {
    title: 'Pay-Per-Click Advertising (PPC)',
    description:
      'Google Ads, Local Services Ads, Microsoft Ads and Meta — managed with call tracking, CRO and revenue-grade attribution.',
    icon: 'fa-bullhorn',
    href: '/pay-per-click-advertising/',
  },
];

export const TRUST_LOGOS = [
  'HVAC Pros',
  'PlumbCo',
  'BrightVolt',
  'GreenLawn',
  'CleanCrew',
  'AquaPool',
  'RoofRight',
  'PestGuard',
];

export const TESTIMONIALS = [
  {
    quote:
      'Great Company all around! From people taking orders to the editing/proof team — I would not go with anyone else. We got into a bind and the team did not hesitate getting our material out fast and ready for our show!',
    name: 'Derek B.',
    role: 'Owner, Home Services',
    rating: 5,
  },
  {
    quote:
      'Our calls doubled in 90 days. The Print Fast team treats our business like their own — strategy, content and reporting all flow from one place.',
    name: 'Maria L.',
    role: 'Operations Manager, HVAC Co.',
    rating: 5,
  },
  {
    quote:
      'Finally a marketing partner who actually understands the trades. The free digital review alone gave us a six-month roadmap.',
    name: 'James R.',
    role: 'Founder, Plumbing Services',
    rating: 5,
  },
];

export const STATS = [
  { value: '15+', label: 'Years serving the trades' },
  { value: '500+', label: 'Home-service brands grown' },
  { value: '4.9/5', label: 'Average client rating' },
  { value: '12M+', label: 'Leads generated for clients' },
];
