export interface ContactPlanOption {
  slug: string;
  label: string;
  price?: string;
  amount?: number | null;
  period?: string;
  description?: string;
}

export interface ContactServiceOption {
  slug: string;
  label: string;
  plans: ContactPlanOption[];
}

export const CONTACT_SERVICE_OPTIONS: ContactServiceOption[] = [
  {
    slug: 'digital-marketing-services',
    label: 'Digital Marketing Services',
    plans: [],
  },
  {
    slug: 'managed-social-media',
    label: 'Managed Social Media',
    plans: [
      { slug: 'foundation-plan', label: 'Foundation Plan', price: '$499.99', amount: 499.99, period: '/mo', description: '8 branded posts per month with starter boost budget.' },
      { slug: 'growth-plan', label: 'Growth Plan', price: '$699.99', amount: 699.99, period: '/mo', description: '12 branded posts per month for growing brands.' },
      { slug: 'authority-plan', label: 'Authority Plan', price: '$1,049.99', amount: 1049.99, period: '/mo', description: '15 branded posts per month with deeper strategy.' },
      { slug: 'enterprise-plan', label: 'Enterprise Plan', price: 'Call for pricing', amount: null, period: '', description: 'Custom social media plan for enterprise operations.' },
    ],
  },
  {
    slug: 'organic-digital-marketing',
    label: 'Organic Digital Marketing',
    plans: [
      { slug: 'local', label: 'Local', price: '$1,299', amount: 1299, period: '/mo', description: 'Local SEO foundations for single-location businesses.' },
      { slug: 'growth', label: 'Growth', price: '$2,899', amount: 2899, period: '/mo', description: 'SEO growth plan for brands competing across multiple cities.' },
      { slug: 'authority', label: 'Authority', price: '$5,499', amount: 5499, period: '/mo', description: 'Authority SEO for market leaders investing in organic dominance.' },
    ],
  },
  {
    slug: 'pay-per-click-advertising',
    label: 'Pay-Per-Click Advertising',
    plans: [
      { slug: 'starter-ppc', label: 'Starter PPC', price: '$899', amount: 899, period: '/mo', description: 'Local paid search and LSA management for smaller ad budgets.' },
      { slug: 'growth-ppc', label: 'Growth PPC', price: '$1,899', amount: 1899, period: '/mo', description: 'Multi-channel paid media management for growing brands.' },
      { slug: 'scale-ppc', label: 'Scale PPC', price: '12% of spend', amount: null, period: '/mo', description: 'Senior PPC management for brands spending $30k+ per month.' },
    ],
  },
  {
    slug: 'email-marketing',
    label: 'Email Marketing',
    plans: [
      { slug: 'foundations', label: 'Foundations', price: '$749', amount: 749, period: '/mo', description: 'Core email setup, templates and foundational automations.' },
      { slug: 'growth', label: 'Growth', price: '$1,499', amount: 1499, period: '/mo', description: 'Revenue-focused sends, segmentation and testing.' },
      { slug: 'lifecycle', label: 'Lifecycle', price: '$2,899', amount: 2899, period: '/mo', description: 'Advanced lifecycle automation and revenue attribution.' },
    ],
  },
  {
    slug: 'website-creation',
    label: 'Website Creation',
    plans: [
      { slug: 'essentials', label: 'Essentials', price: '$1,499', amount: 1499, period: ' one-time', description: 'Starter website for small home-service businesses.' },
      { slug: 'standard', label: 'Standard', price: '$2,999', amount: 2999, period: ' one-time', description: 'Growth website with expanded service pages.' },
      { slug: 'premium', label: 'Premium', price: '$4,999', amount: 4999, period: ' one-time', description: 'Full site with local SEO and content baked in.' },
      { slug: 'ai-enabled', label: 'AI-Enabled', price: '$9,999', amount: 9999, period: ' one-time', description: 'Top-tier website with AI assistant support.' },
    ],
  },
  {
    slug: 'video-marketing',
    label: 'Video Marketing',
    plans: [],
  },
  {
    slug: 'free-digital-review',
    label: 'Free Digital Review',
    plans: [],
  },
  {
    slug: 'other-not-sure',
    label: 'Other / Not sure',
    plans: [],
  },
];

export const SOCIAL_MEDIA_PLANS = [
  {
    name: 'Foundation Plan',
    price: '$499.99',
    description: 'Best for startups and small businesses building a consistent presence.',
    features: [
      '8 branded posts per month',
      '10 networks: Facebook, Instagram, GBP, LinkedIn, YouTube, TikTok, X, Pinterest, Threads, Bluesky and Reddit',
      '1x setup fee: $999.99, waived for annual plans',
      '1 - 30 min social strategy session',
      'Monthly reporting, content calendar and hashtag research',
      '2 boosted posts/month with +$100 boost spend',
    ],
    cta: { label: 'Start Foundation', href: '/contact-us/?service=managed-social-media&plan=foundation-plan#contact-form' },
  },
  {
    name: 'Growth Plan',
    price: '$699.99',
    description: 'Best for growing businesses that need stronger creative and strategy cadence.',
    popular: true,
    features: [
      '12 branded posts per month',
      '10 networks with branded platform optimization',
      '1x setup fee: $2,999.99, waived for annual plans',
      '2 - 30 min social strategy sessions',
      '1 - 60 min monthly strategy session plus standard reporting',
      '2 boosted posts/month with +$200 boost spend',
    ],
    cta: { label: 'Choose Growth', href: '/contact-us/?service=managed-social-media&plan=growth-plan#contact-form' },
  },
  {
    name: 'Authority Plan',
    price: '$1,049.99',
    description: 'Best for established and expanding brands that need more publishing velocity.',
    features: [
      '15 branded posts per month',
      '10 networks plus social audit and recommendations',
      '1x setup fee: $4,999.99, waived for annual plans',
      '2 - 30 min social strategy sessions',
      '1 - 60 min monthly strategy session with keyword/tagging research',
      '3-4 boosted posts/month with +$400 boost spend',
    ],
    cta: { label: 'Build Authority', href: '/contact-us/?service=managed-social-media&plan=authority-plan#contact-form' },
  },
  {
    name: 'Enterprise Plan',
    price: 'Call for pricing',
    period: '',
    description: 'Best for multi-location and enterprise brands that need a custom operating plan.',
    features: [
      '20+ branded posts per month',
      '10 networks with multi-brand planning support',
      '1x setup fee: $750+, waived for annual plans',
      '2 - 30 min social strategy sessions',
      '2 - 60 min monthly strategy sessions and expanded reporting',
      'Custom boosted-post budget and enterprise publishing workflow',
    ],
    cta: { label: 'Contact Enterprise', href: '/contact-us/?service=managed-social-media&plan=enterprise-plan#contact-form' },
  },
];

const normalize = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

export const findContactServiceOption = (value?: string | null) => {
  if (!value) return undefined;
  const normalized = normalize(value);
  return CONTACT_SERVICE_OPTIONS.find((service) => service.slug === normalized || normalize(service.label) === normalized);
};

export const findContactPlanOption = (service: ContactServiceOption | undefined, value?: string | null) => {
  if (!service || !value) return undefined;
  const normalized = normalize(value);
  return service.plans.find((plan) => plan.slug === normalized || normalize(plan.label) === normalized);
};

export const getContactHref = (serviceSlug: string, planSlug?: string) => {
  const params = new URLSearchParams({ service: serviceSlug });
  if (planSlug) params.set('plan', planSlug);
  return `/contact-us/?${params.toString()}#contact-form`;
};

export const getCheckoutHref = (serviceSlug: string, planSlug?: string) => {
  const params = new URLSearchParams({ service: serviceSlug });
  if (planSlug) params.set('plan', planSlug);
  return `/checkout/?${params.toString()}`;
};