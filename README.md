# Print Fast Digital Marketing — Marketing Website

A modern, fully responsive marketing website built with **Astro + TypeScript + Tailwind CSS**, with **SCSS** reserved for advanced styling and **Font Awesome** for icons.

## Tech stack

- ⚡ **Astro 4** — fast, content-first, zero-JS by default
- 🟦 **TypeScript** with strict mode and `@/*` path aliases
- 🎨 **Tailwind CSS 3** with custom brand palette + plugins (`forms`, `typography`)
- 💅 **SCSS** for marquees, gradient blobs, ribbon and reveal animations
- 🧩 **Font Awesome 6** (free, bundled — no CDN)
- 🗺️ **`@astrojs/sitemap`** for auto-generated `sitemap-index.xml`

## Project structure

```
.
├── astro.config.mjs
├── tailwind.config.mjs
├── postcss.config.mjs
├── tsconfig.json
├── public/
│   ├── favicon.svg
│   ├── og-default.svg
│   └── robots.txt
└── src/
    ├── components/      # Reusable UI: Header, Footer, Hero, CTA, etc.
    ├── data/            # Site config + content data (typed)
    ├── layouts/         # BaseLayout (SEO, fonts, OG, JSON-LD, skip link)
    ├── pages/           # Routed pages (.astro)
    └── styles/
        ├── global.css   # Tailwind layers + design tokens
        └── scss/main.scss
```

## Pages

| Path                              | Purpose                       |
| --------------------------------- | ----------------------------- |
| `/`                               | Home / overview               |
| `/managed-social-media/`          | Managed Social Media service  |
| `/organic-digital-marketing/`     | Organic Digital Marketing     |
| `/video-marketing/`               | Video Marketing               |
| `/free-digital-review/`           | Free Digital Review (lead)    |
| `/404`                            | Custom 404                    |

## Components

`Header`, `Footer`, `Hero`, `Stats`, `TrustStrip`, `SectionHeading`, `ServiceCard`, `FeatureGrid`, `PricingCard`, `Testimonials`, `CTA`, `ContactForm`.

All components are typed via `Astro.Props` interfaces and accept reusable props for content, icons, CTAs and variants.

## Getting started

```bash
# install deps
npm install

# start the dev server
npm run dev

# production build
npm run build

# preview the build
npm run preview
```

The dev server runs at **http://localhost:4321** by default.

## SEO & performance

- Mobile-first, semantic HTML with proper heading hierarchy
- Per-page `<title>`, `<meta description>`, canonical, Open Graph + Twitter cards
- Organization JSON-LD in the base layout
- Auto-generated sitemap + `robots.txt`
- Fonts preconnected; Tailwind purges unused CSS at build time
- Astro ships zero JS by default; only the small mobile-menu + reveal-on-scroll scripts are included

## Design system

Brand tokens live in `tailwind.config.mjs` (colors, fonts, shadows, gradients, animations). Component primitives like `btn-primary`, `card`, `eyebrow`, `heading-xl`, `gradient-text` and `check-list` are defined in `src/styles/global.css` under `@layer components`.

SCSS in `src/styles/scss/main.scss` is reserved for things Tailwind alone doesn't handle elegantly:

- `pf-marquee` — masked, infinite logo strip
- `pf-blob` — animated radial gradient blobs
- `pf-ribbon` — diagonal "Popular" ribbon for pricing
- `[data-reveal]` — IntersectionObserver-driven scroll reveals

---

© Print Fast Digital Marketing.
