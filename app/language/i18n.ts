// app/language/i18n.ts
import { InitOptions } from "i18next";

const i18nConfig: InitOptions = {
  lng: "vi",
  fallbackLng: "vi",
  supportedLngs: ["en", "vi"],
  interpolation: {
    escapeValue: false,
  },
};

export default i18nConfig;
