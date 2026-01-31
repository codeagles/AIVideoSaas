/**
 * Email Templates
 *
 * All email templates and utilities for VideoFly
 */

export { MagicLinkEmail } from "./magic-link-email";
export { WelcomeEmail } from "./welcome-email";
export { ResetPasswordEmail } from "./reset-password-email";
export {
  getEmailTranslations,
  getSiteConfig,
  renderWelcomeEmail,
  renderResetPasswordEmail,
  sendWelcomeEmail,
  sendResetPasswordEmail,
} from "./utils";
