import { fileURLToPath } from 'node:url';
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import react from '@astrojs/react';
import { commonAliases } from '../packages/common/src/aliases.mjs';

// Tells the shared design system which origin it is rendering for, so
// cross-site links (shop, ROAS) resolve to absolute URLs while same-site links
// stay relative. Must be set before Vite reads the environment.
process.env.PUBLIC_SITE_ID = 'main';

const workspaceRoot = fileURLToPath(new URL('..', import.meta.url));

const SITE_URL = process.env.PUBLIC_MAIN_SITE_URL || 'https://marketing.print-fast.com';
const DEV_PORT = Number(process.env.MAIN_SITE_PORT || 9000);

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
