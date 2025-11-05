import path from "path";
import type { StorybookConfig } from "@storybook/react-vite";
import tsconfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";

const config: StorybookConfig = {
  stories: [
    "../.storybook/**/*.stories.@(ts|tsx|mdx)"
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
        root: "./"
      })
    );

    // Include image assets (SVG, PNG, etc.)
    viteConfig.assetsInclude = ["**/*.svg", "**/*.png"];

    // Patch DART SASS console warnings
    viteConfig.css = viteConfig.css || {};
    viteConfig.css.preprocessorOptions = viteConfig.css.preprocessorOptions || {};
    viteConfig.css.preprocessorOptions.scss = {
      silenceDeprecations: [
        'import',
        'global-builtin',
        'legacy-js-api',
        'color-functions'
      ],
    };

    // Patch resolve aliases
    viteConfig.resolve = viteConfig.resolve || {};
    viteConfig.resolve.alias = {
      ...(viteConfig.resolve.alias || {}),
      "@styles": path.resolve(__dirname, "styles")
    };
    return viteConfig;
  }
};

export default config;
