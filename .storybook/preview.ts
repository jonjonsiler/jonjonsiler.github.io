import type { Preview } from "@storybook/react";
import { withEnglishI18n } from "./decorators/withEnglishI18n";
import "./styles/storybook.scss";

const preview: Preview = {
  decorators: [withEnglishI18n],
  parameters: {
    actions: { argTypesRegex: "^on[A-Z].*" },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i
      }
    }
  }
};

export default preview;
