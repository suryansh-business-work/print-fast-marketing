import { fileURLToPath } from 'node:url';

const dir = (segment) => fileURLToPath(new URL(`./${segment}`, import.meta.url));

/**
 * Vite/Astro aliases pointing at the shared design system.
 *
 * Every app spreads these into `vite.resolve.alias` so `@components/…`,
 * `@layouts/…`, `@data/…` etc. resolve to `packages/common/src` from anywhere —
 * including from inside the shared components themselves. Keeping the specifiers
 * identical to the pre-split layout is what let all ~55 pages move without a
 * single import change.
 *
 * Mirror any addition here in each app's tsconfig `paths` so the editor agrees
 * with the bundler.
 */
export const commonAliases = [
  { find: /^@components\//, replacement: dir('components/') },
  { find: /^@layouts\//, replacement: dir('layouts/') },
  { find: /^@styles\//, replacement: dir('styles/') },
  { find: /^@data\//, replacement: dir('data/') },
  { find: /^@config\//, replacement: dir('config/') },
  { find: /^@seo\//, replacement: dir('seo/') },
  { find: /^@common\//, replacement: dir('') },
];

/** Glob for Tailwind's `content` scanning of the shared design system. */
export const commonContentGlob = fileURLToPath(
  new URL('./**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}', import.meta.url)
).replace(/\\/g, '/');
