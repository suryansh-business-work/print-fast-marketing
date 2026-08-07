import { fileURLToPath } from 'node:url';
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import react from '@astrojs/react';
import { commonAliases } from '../packages/common/src/aliases.mjs';

// Tells the shared design system which origin it is rendering for, so
// marketing links become absolute URLs while shop links stay relative.
// Must be set before Vite reads the environment.
process.env.PUBLIC_SITE_ID = 'shop';

const workspaceRoot = fileURLToPath(new URL('..', import.meta.url));

const SITE_URL = process.env.PUBLIC_SHOP_SITE_URL || 'https://shop.print-fast.com';
const DEV_PORT = Number(process.env.SHOP_SITE_PORT || 9001);

// https://astro.build/config
export default defineConfig({
  site: SITE_URL,
  integrations: [
    tailwind({ applyBaseStyles: false }),
    sitemap(),
    react(),
  ],
  server: {
    port: DEV_PORT,
    host: true,
  },
  build: {
    inlineStylesheets: 'auto',
  },
  compressHTML: true,
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'viewport',
  },
  vite: {
    // One .env at the repo root feeds every app in the monorepo.
    envDir: workspaceRoot,
    resolve: {
      alias: commonAliases,
    },
    server: {
      // The design system lives outside this app's root.
      fs: { allow: [workspaceRoot] },
    },
  },
});
