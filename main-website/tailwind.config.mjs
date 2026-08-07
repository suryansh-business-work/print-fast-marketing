import preset from '../packages/common/tailwind.preset.mjs';
import { commonContentGlob } from '../packages/common/src/aliases.mjs';

/** @type {import('tailwindcss').Config} */
export default {
  presets: [preset],
  content: [
    './src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}',
    // The shared design system ships the majority of the markup.
    commonContentGlob,
  ],
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
};
