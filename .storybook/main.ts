import path from "node:path";
import type { StorybookConfig } from "@storybook/react-vite";
import tsconfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";

const config: StorybookConfig = {
  stories: [
    "../src/**/*.stories.@(ts|tsx|mdx)"
  ],
  addons: [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/addon-interactions"
  ],
  framework: {
    name: "@storybook/react-vite",
    options: {}
  },
  docs: {
    autodocs: "tag"
  },
  viteFinal: async (viteConfig) => {
    viteConfig.plugins = viteConfig.plugins ?? [];
    viteConfig.plugins.push(
      tailwindcss(),
      tsconfigPaths({
        projects: [
          path.resolve(__dirname, "../tsconfig.base.json"),
        ]
      })
    );

    // Include image assets (SVG, PNG, etc.)
    viteConfig.assetsInclude = ["**/*.svg", "**/*.png"];

    viteConfig.resolve = viteConfig.resolve || {};
    viteConfig.resolve.alias = {
      ...(viteConfig.resolve.alias || {}),
      '@images': path.resolve(__dirname, '../public/images'),
      '@styles': path.resolve(__dirname, './styles'),
    };

    return viteConfig;
  }
};

export default config;
