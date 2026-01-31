import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";
import { getMessagesForLocale } from "./messages";

/**
 * i18n/request.ts provides configuration for server-only code,
 * i.e. Server Components, Server Actions & friends.
 *
 * The configuration is provided via the getRequestConfig function.
 *
 * The configuration object is created once for each request by internally using React's cache.
 * The first component to use internationalization will call the function defined with getRequestConfig.
 *
 * https://next-intl.dev/docs/usage/configuration
 */
export default getRequestConfig(async ({ requestLocale }) => {
  // This typically corresponds to the `[locale]` segment
  let locale = await requestLocale;

  // Ensure that a locale is provided
  if (!locale || !routing.locales.includes(locale as any)) {
    locale = routing.defaultLocale;
  }

  const messages = await getMessagesForLocale(locale);

  return {
    locale,
    messages,
  };
});
