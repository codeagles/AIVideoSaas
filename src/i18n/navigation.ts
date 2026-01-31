import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

/**
 * Navigation APIs
 *
 * https://next-intl.dev/docs/routing/navigation
 *
 * Provides:
 * - Link: Localized link component that handles locale prefix automatically
 * - getPathname: Get localized pathname
 * - redirect: Localized redirect
 * - usePathname: Hook to get current pathname
 * - useRouter: Hook for programmatic navigation
 */
export const {
  Link: LocaleLink,
  getPathname: getLocalePathname,
  redirect: localeRedirect,
  usePathname: useLocalePathname,
  useRouter: useLocaleRouter,
} = createNavigation(routing);
