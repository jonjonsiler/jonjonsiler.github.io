// @ts-check
import path from "node:path";
import { defineConfig } from 'astro/config';
import tsconfigPaths from "vite-tsconfig-paths";
import react from '@astrojs/react';
// import vue from '@astrojs/vue';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  vite: {
    plugins: [
      tailwindcss(),
      tsconfigPaths()
    ],
    css: {
      preprocessorOptions: {
        scss: {
           // Suppress deprecation warnings from SCSS (dart-sass) for bootstrap dependency
          silenceDeprecations: [
            'import',
            "global-builtin",
            "color-functions",
            "slash-div",
            "elseif",
            "new-global",
          ],
        }
      }
    }
  },
  integrations: [
    react(),
    // vue()
  ],
});
