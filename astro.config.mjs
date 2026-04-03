// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
// Set PUBLIC_SITE_URL on Netlify (e.g. https://yourdomain.com) so canonical URLs + JSON-LD stay correct.
export default defineConfig({
  site: import.meta.env.PUBLIC_SITE_URL || 'https://huntandhaul.netlify.app',
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()],
  },
});