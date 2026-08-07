/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

interface ImportMetaEnv {
  /** 'main' | 'shop' — set by this app's astro.config.mjs. */
  readonly PUBLIC_SITE_ID?: string;
  readonly PUBLIC_MAIN_SITE_URL?: string;
  readonly PUBLIC_SHOP_SITE_URL?: string;
  readonly PUBLIC_ROAS_APP_URL?: string;
  readonly PUBLIC_ROAS_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
