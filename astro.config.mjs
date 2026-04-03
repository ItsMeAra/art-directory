// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
// Canonical URLs + JSON-LD use `site`. Override with PUBLIC_SITE_URL (e.g. preview deploys) if needed.
export default defineConfig({
  site: import.meta.env.PUBLIC_SITE_URL || 'https://huntandhaul.artcollector.wtf',
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()],
  },
});