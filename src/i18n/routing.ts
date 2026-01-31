import { defineRouting } from "next-intl/routing";
import { i18n, LOCALE_COOKIE_NAME } from "@/config/i18n-config";

/**
 * Next.js internationalized routing
 *
 * https://next-intl.dev/docs/routing
 */
export const routing = defineRouting({
  // A list of all locales that are supported
  locales: i18n.locales,
  // Default locale when no locale matches
  defaultLocale: i18n.defaultLocale,
  // Disable auto detect locale - we'll use cookie preference
  localeDetection: false,
  // Once a locale is detected, it will be remembered for
  // future requests by being stored in a cookie.
  localeCookie: {
    name: LOCALE_COOKIE_NAME,
  },
  // The prefix to use for the locale in the URL
  // 'as-needed' means: default locale (en) has no prefix, others have prefix
  // e.g., /about (en), /zh/about (zh)
  localePrefix: "as-needed",
});
