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
  name: 'PrintFast',
  fullName: 'PrintFast Digital Marketing',
  tagline: 'Performance marketing for U.S. home-service brands',
  description:
    'PrintFast is a U.S. home service marketing agency delivering SEO, Google Ads (PPC), social media marketing, email marketing and website creation for HVAC, plumbing, roofing, electrical and home service contractors — all under one accountable team. Serving contractors nationwide from Middlesex, NJ.',
  url: 'https://marketing.print-fast.com',
  phone: '800-810-4818',
  phoneHref: 'tel:800-810-4818',
  email: 'marketing@print-fast.com',
  hours: 'Mon–Fri · 8 AM – 5 PM ET',
  address: {
    company: 'PrintFast',
    street: '100 Blackford Ave.',
    city: 'Middlesex',
    state: 'NJ',
    zip: '08846',
    country: 'USA',
    full: '100 Blackford Ave., Middlesex, NJ 08846',
    lat: 40.5734,
    lng: -74.4960,
  },
  logo: '/logo/logo-print-fast-light.png',
  logoLight: '/logo/logo-print-fast-light.png',
  logoDark: '/logo/logo-print-fast-dark.png',
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
    facebook: 'https://www.facebook.com/PrintFastLLC/',
    instagram: 'https://instagram.com',
    linkedin: 'https://www.linkedin.com/company/printfast',
    youtube: 'https://youtube.com',
  },
};

export const TEAM = [
  {
    name: 'Bill McGowan',
    role: 'President / CEO and Marketing Warrior',
    email: 'bill@print-fast.com',
    icon: 'fa-crown',
  },
  {
    name: 'Kim Burke',
    role: 'General Manager',
    email: 'kim@print-fast.com',
    icon: 'fa-user-tie',
  },
  {
    name: 'Mark Luffy',
    role: 'CSR Lead',
    email: 'mark@print-fast.com',
    icon: 'fa-headset',
  },
];

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
  { label: 'SEO for Home Service Companies', href: '/search-engine-optimization/' },
  { label: 'Pay-Per-Click Advertising', href: '/pay-per-click-advertising/' },
];

export const SERVICES: ServiceCard[] = [
  {
    title: 'Social Media Marketing',
    description:
      'Full-service social media strategy, content creation, scheduling and paid social advertising across Facebook, Instagram, TikTok, LinkedIn and YouTube — built to grow your home service brand and convert followers into booked jobs.',
    icon: 'fa-share-nodes',
    href: '/social-media-marketing/',
  },
  {
    title: 'Email Marketing',
    description:
      'CAN-SPAM-compliant email marketing - newsletters, seasonal lifecycle automations and win-back flows engineered to compound customer lifetime value for HVAC, plumbing and home service brands.',
    icon: 'fa-envelope-open-text',
    href: '/email-marketing/',
  },
  {
    title: 'Website Creation',
    description:
      'Fast-loading, mobile-first contractor websites with ADA accessibility compliance, Core Web Vitals optimization and conversion-first design — built to rank in local search and turn visitors into booked calls from day one.',
    icon: 'fa-globe',
    href: '/website-creation/',
  },
  {
    title: 'Search Engine Optimization (SEO)',
    description:
      'Local SEO, technical SEO, content marketing and AI-search optimization that puts your HVAC, plumbing or roofing company on page one of Google when U.S. homeowners are ready to book.',
    icon: 'fa-magnifying-glass-chart',
    href: '/search-engine-optimization/',
  },
  {
    title: 'Pay-Per-Click Advertising (PPC)',
    description:
      'Google Ads, Local Services Ads (LSA), Bing Ads and Meta campaigns managed with full call tracking, landing page CRO and revenue-grade attribution — so every dollar of ad spend ties back to a booked job.',
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

// Real client logos shown in the rotating client strip.
// Hosted on PrintFast's CloudFront CDN.
const CLIENT_LOGO_BASE = 'https://dqj17tese79do.cloudfront.net/printfast/images/common';

export interface ClientLogo {
  name: string;
  src: string;
}

const CLIENT_LOGO_FILES: string[] = [
  'magic.png','nashoba.png','innovative.png','j_and_j.png','good_guys.png','healthy_homes.png','pac.png','comfort_control.png',
  'boss.png','all_pro_plumbing.png','lightfoot.png','falcon_services.png','chad_love.png','KC_waterproofing.png','daniel.png',
  'msp.png','gudorf.png','all_hours_air.png','service_command.png','giannone.png','a_to_z.png','assured_comfort.png',
  'easy_rooter.png','champion.png','air_serv.png','mr_sparky.png','twebber.png','all_hours.png','gietzen.png','quail.png',
  'absolute.png','paramount.png','wired.png','morrison.png','colepepper.png','lion.png','professional.png','cch_mechanical.png',
  'cornerstone.png','dr_energysaver.png','gilmore.png','millers_services.png','climate_partners.png','nytech.png','wilson.png',
  'cool_it.png','gold_shield.png','just_right.png','puredry.png','clockwork.png','mhc.png','triple_service.png','aap.png',
  'electricians.png','gold_medal.png','air_time.png','folkes.png','carney.png','climate_care.png','addario.png','craigs.png',
  'dog_house.png','friendly.png','hartlaub.png','hunts.png','jp.png','maverick.png','northern_colorado.png','parker.png',
  'service_max.png','weltman.png','marshall.png','gold_eagle.png','clearwater.png','ysp.png','hardcastle.png','trademark.png',
  'gladiator.png','gold_star.png','einstein_pros.png','medley.png','rowells.png','air_south.png','mcquillan.png',
  'service_olympians.png','ceow.png','kings.png','central.png','electric_city.png','mccuen.png','copeland.png','arrow.png',
  'gubruds.png','protocool.png','blue_label.png','service_experts.png','decker.png','harts.png','orion.png','correct_temp.png',
  'roto_rooter.png','dear.png','blackwell.png','premier_power.png','cc_meyers.png','rodenhiser.png','einsteins.png',
  'comfort_technologiespsd.png','total_comfort.png','davis.png','nicholson.png','electrical_detectives.png','dc_cheek.png',
  'plumbing_masters.png','harts_home.png','tartan.png','daniels.png','evolution.png','petri.png','conserva.png','option_one.png',
  'topline.png','griffin.png','air_pros.png','roberts.png','intelligent.png','baker.png','titantium.png','eternal.png',
  'neerings.png','american.png','marklein.png','falcon.png','magothy.png','southern_trust.png','joe_cool.png','greely.png',
  'heat_depot.png','envirotech.png','all_services.png','sewer_surgeons.png','grand_canyon.png','reliance.png','home_furniture.png',
  'plesh.png','commonwealth.png','ohmstead.png','hobaica.png','cbus.png','rcs.png','j_and_s.png','patriot.png','magnolia.png',
  'one_source.png','essig.png',
];

export const CLIENT_LOGOS: ClientLogo[] = CLIENT_LOGO_FILES.map((file) => {
  const slug = file.replace(/\.[^.]+$/, '').replace(/_/g, ' ');
  const name = slug
    .split(' ')
    .map((w) => (w.length <= 3 ? w.toUpperCase() : w.charAt(0).toUpperCase() + w.slice(1)))
    .join(' ');
  return { name, src: `${CLIENT_LOGO_BASE}/${file}` };
});

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
      'Our calls doubled in 90 days. The PrintFast team treats our business like their own — strategy, content and reporting all flow from one place.',
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
  { value: '35+', label: 'Years of home service marketing experience' },
  { value: '2,000+', label: 'U.S. home service brands' },
  { value: '4.3/5', label: 'Average client rating' },
  { value: '12M+', label: 'Qualified leads generated for U.S. home service contractors — calls, forms and booked jobs' },
];
