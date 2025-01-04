import path from "path";

export const i18n = {
  defaultLocale: "vi",
  locales: ["en", "vi"],
  localeDetection: false,
} as const;

export const localePath = path.resolve("./app/locales");

export type Locale = (typeof i18n)["locales"][number];
