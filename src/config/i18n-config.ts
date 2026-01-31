export const i18n = {
  defaultLocale: "en", // 改为英语作为默认语言
  locales: ["en", "zh"],
} as const;

export type Locale = (typeof i18n)["locales"][number];

// 语言配置对象（用于 next-intl）
export const localeConfig = {
  en: {
    flag: "🇺🇸",
    name: "English",
    hreflang: "en",
  },
  zh: {
    flag: "🇨🇳",
    name: "中文",
    hreflang: "zh-CN",
  },
} as const;

// Cookie 名称
export const LOCALE_COOKIE_NAME = "NEXT_LOCALE";

// 向后兼容的 localeMap
export const localeMap = {
  en: "English",
  zh: "中文",
} as const;
