import { defineConfig } from "vite";

export default defineConfig({
  build: {
    outDir: "dist/etsy",
    emptyOutDir: false,
    lib: {
      entry: "etsy-widget/src/etsy-gallery.ts",
      formats: ["iife"],
      name: "EtsyGalleryWidget",
      fileName: () => "etsy-gallery.js",
    },
    sourcemap: true,
  },
});