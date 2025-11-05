// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
// import vue from '@astrojs/vue';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
    resolve: {
        alias: {
          '@partials': new URL('./src/partials', import.meta.url).pathname,
          '@components': new URL('./src/components', import.meta.url).pathname,
          '@layouts': new URL('./src/layouts', import.meta.url).pathname,
          '@styles': new URL('./src/styles', import.meta.url).pathname,
          '@images': new URL('./src/images', import.meta.url).pathname,
        },
      },

  },
  integrations: [
    react(),
    // vue()
  ],
});