# PrintFast Platform

A pnpm monorepo holding every PrintFast surface. One repo, one design system,
one deploy pipeline.

```text
print-fast-marketing/
├── main-website/        Astro · marketing site        · dev :9000 · marketing.print-fast.com
├── shop-website/        Astro · Shop PrintFast        · dev :9001 · shop.print-fast.com
├── roas/
│   ├── client/          Vite + React · ROAS dashboard · dev :9002 · roas.print-fast.com
│   └── server/          Express + MongoDB · ROAS API  · dev :9003 · roas-server.print-fast.com
├── packages/
│   └── common/          Shared design system (layouts, components, data, styles, SEO)
├── deploy/              apps.json manifest + rendered Nginx + remote provisioner
└── scripts/             Workspace tooling (assets, nginx, links, SSL, clean)
```

## Getting started

```bash
pnpm install
cp .env.example .env      # fill in what you need — see "Environment" below
pnpm dev                  # all four apps at once
```

Or run them individually:

```bash
pnpm dev:main             # :9000  marketing
pnpm dev:shop             # :9001  shop
pnpm dev:web              # both Astro sites
pnpm dev:roas             # :9002 + :9003
pnpm dev:roas:client      # :9002
pnpm dev:roas:server      # :9003  (needs MONGODB_URI)
```

## The shared design system

`packages/common` holds every layout, component, data model and style. Both Astro
apps consume it **as source** through the same aliases the pre-split repo used:

```ts
import BaseLayout from '@layouts/BaseLayout.astro';
import { SITE } from '@data/site';
```

Those aliases resolve to `packages/common/src/*` via `packages/common/src/aliases.mjs`
(wired into each app's `vite.resolve.alias`) and each app's `tsconfig` `paths`.
Adding an alias means editing both — they are listed side by side in
`aliases.mjs`.

Tailwind theme lives in `packages/common/tailwind.preset.mjs`; each app extends
it and adds its own `content` globs.

### Linking across sites

The two sites are separate origins, so a shared header cannot use bare paths for
everything. `packages/common/src/config/sites.ts` solves this: each app sets
`PUBLIC_SITE_ID` in its `astro.config.mjs`, and `mainHref()` / `shopHref()`
return a **relative path when the target is the current site** and an **absolute
URL when it is not**.

```ts
mainHref('/contact-us/')
//  on main-website -> /contact-us/
//  on shop-website -> https://marketing.print-fast.com/contact-us/
```

Nothing in a component needs to know which site it is rendering inside. Override
any origin with the matching `PUBLIC_*_URL` variable — point them at localhost to
click between the two sites while developing.

### Static assets

Shared assets (favicons, logo, the 19 MB image library) live once in
`packages/common/public/`. Per-site files live in `<app>/public-src/`
(`robots.txt` today). `scripts/sync-public.mjs` merges the two into
`<app>/public/`, which is generated and gitignored — it runs automatically before
every `dev` and `build`.

Put a new shared image in `packages/common/public/images/`; put a site-specific
file in that site's `public-src/`.

## Verifying changes

```bash
pnpm verify        # build both sites, then check every internal link resolves
pnpm check:links   # link check on the existing build output
pnpm type-check    # astro check + tsc across the workspace
pnpm clean         # drop build output and generated dirs (--deps also drops node_modules)
```

`pnpm check:links` is the guard that matters most after the site split: it walks
the built HTML and fails on any root-relative href with no matching file in that
site's own `dist/`, which is exactly how a cross-site link goes wrong.

## Environment

One `.env` at the repo root feeds every app — both Astro apps read it via
`vite.envDir`, the ROAS client via `envDir`, and the ROAS server by walking up
from its own directory. Start from `.env.example`, which documents every
variable.

The values you will actually need to supply:

| Variable | Needed for |
| --- | --- |
| `MONGODB_URI` | ROAS server — MongoDB Atlas connection string |
| `SESSION_SECRET`, `JWT_SECRET` | ROAS server — generate with `openssl rand -hex 32` |
| `GOD_USER_EMAIL`, `GOD_USER_PASSWORD` | ROAS seeded super-admin |
| `SMTP_*` | ROAS outbound email |
| `IMAGEKIT_*` | ROAS image uploads |
| `VITE_GOOGLE_MAPS_API_KEY` | ROAS maps |
| `SERVICE_TITAN_APP_KEY`, `OPENAI_API_KEY` | Optional ROAS integrations |
| `DEPLOY_*`, `CERTBOT_EMAIL` | Local `pnpm ssl:*` helper scripts only |

The `PUBLIC_*_URL` origins already default to production and only need
overriding for local cross-site testing. In CI these come from
`deploy/apps.json` and GitHub Actions secrets, not from `.env`.

## Deploying

Push to `main`. See [deploy/README.md](deploy/README.md) for the manifest,
secrets, DNS records and TLS commands.

```bash
pnpm ssl:status    # certificate expiry
pnpm ssl:renew     # force renewal
pnpm remote:status # containers + nginx health on the VPS
```
