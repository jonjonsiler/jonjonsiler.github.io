import React from "react";
import type { Decorator } from "@storybook/react";
import { I18nextProvider, initReactI18next } from "react-i18next";
import { createInstance, type Resource } from "i18next";
import en from "../i18n/en.json";

const resources: Resource = {
  en,
};

const namespaces = Object.keys(en);
const defaultNS = namespaces.includes("translation")
  ? "translation"
  : namespaces[0] ?? "translation";

const I18nWrapper: React.FC<React.PropsWithChildren> = ({ children }) => {
  const i18n = React.useMemo(() => {
    const instance = createInstance();
    instance.use(initReactI18next).init({
      resources,
      lng: "en",
      fallbackLng: "en",
      ns: namespaces,
      defaultNS,
      interpolation: { escapeValue: false },
      initImmediate: false,
    });
    return instance;
  }, []);

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
};

export const withEnglishI18n: Decorator = (Story) => (
  <I18nWrapper>
    <Story />
  </I18nWrapper>
);
