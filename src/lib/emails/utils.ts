/**
 * Email Translation Utilities
 *
 * 提供邮件模板的翻译加载和使用功能
 */

import { getMessages } from "next-intl/server";

export interface EmailTranslations {
  welcome: {
    subject: string;
    greeting: string;
    title: string;
    body: string;
    features: string;
    featuresList: {
      generate: string;
      models: string;
      share: string;
    };
    cta: string;
    footer: string;
    copyright: string;
  };
  resetPassword: {
    subject: string;
    greeting: string;
    title: string;
    body: string;
    instruction: string;
    button: string;
    validity: string;
    ignore: string;
    security: string;
    footer: string;
    copyright: string;
  };
}

/**
 * 获取指定语言的邮件翻译
 */
export async function getEmailTranslations(
  locale: string = "en"
): Promise<EmailTranslations> {
  const messages = await getMessages({ locale });

  // 从 messages 中提取邮件相关翻译
  const emails = (messages as any).Emails || {};

  return {
    welcome: emails.welcome || {},
    resetPassword: emails.resetPassword || {},
  };
}

/**
 * 获取站点配置（用于邮件中的应用名称等）
 */
export async function getSiteConfig(locale?: string) {
  // 从 site config 导入
  const { siteConfig } = await import("@/config/site");
  return siteConfig;
}

/**
 * 渲染欢迎邮件（服务端使用）
 */
export async function renderWelcomeEmail(
  props: {
    name?: string;
    locale?: string;
    resetUrl?: string;
  }
) {
  const { WelcomeEmail } = await import("@/lib/emails/welcome-email");
  const translations = await getEmailTranslations(props.locale || "en");
  const siteConfig = await getSiteConfig(props.locale);

  return WelcomeEmail({
    name: props.name,
    locale: props.locale,
    translations: translations.welcome,
    appUrl: siteConfig.url,
  });
}

/**
 * 渲染密码重置邮件（服务端使用）
 */
export async function renderResetPasswordEmail(
  props: {
    name?: string;
    locale?: string;
    resetUrl: string;
  }
) {
  const { ResetPasswordEmail } = await import("@/lib/emails/reset-password-email");
  const translations = await getEmailTranslations(props.locale || "en");
  const siteConfig = await getSiteConfig(props.locale);

  return ResetPasswordEmail({
    name: props.name,
    locale: props.locale,
    translations: translations.resetPassword,
    resetUrl: props.resetUrl,
    appUrl: siteConfig.url,
  });
}

/**
 * 发送欢迎邮件
 *
 * @example
 * ```ts
 * await sendWelcomeEmail({
 *   to: "user@example.com",
 *   name: "John",
 *   locale: "en",
 * });
 * ```
 */
export async function sendWelcomeEmail(props: {
  to: string;
  name?: string;
  locale?: string;
}) {
  const { resend } = await import("@/lib/email");
  const { env } = await import("@/lib/auth/env.mjs");
  const siteConfig = await getSiteConfig(props.locale);

  const translations = await getEmailTranslations(props.locale || "en");
  const { WelcomeEmail } = await import("@/lib/emails/welcome-email");

  try {
    await resend.emails.send({
      from: env.RESEND_FROM,
      to: props.to,
      subject: translations.welcome.subject,
      react: WelcomeEmail({
        name: props.name,
        locale: props.locale,
        translations: translations.welcome,
        appUrl: siteConfig.url,
      }),
      headers: {
        "X-Entity-Ref-ID": new Date().getTime() + "",
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to send welcome email:", error);
    return { success: false, error };
  }
}

/**
 * 发送密码重置邮件
 *
 * @example
 * ```ts
 * await sendResetPasswordEmail({
 *   to: "user@example.com",
 *   name: "John",
 *   resetUrl: "https://videofly.app/reset-password?token=xxx",
 *   locale: "en",
 * });
 * ```
 */
export async function sendResetPasswordEmail(props: {
  to: string;
  name?: string;
  resetUrl: string;
  locale?: string;
}) {
  const { resend } = await import("@/lib/email");
  const { env } = await import("@/lib/auth/env.mjs");
  const siteConfig = await getSiteConfig(props.locale);

  const translations = await getEmailTranslations(props.locale || "en");
  const { ResetPasswordEmail } = await import("@/lib/emails/reset-password-email");

  try {
    await resend.emails.send({
      from: env.RESEND_FROM,
      to: props.to,
      subject: translations.resetPassword.subject,
      react: ResetPasswordEmail({
        name: props.name,
        locale: props.locale,
        translations: translations.resetPassword,
        resetUrl: props.resetUrl,
        appUrl: siteConfig.url,
      }),
      headers: {
        "X-Entity-Ref-ID": new Date().getTime() + "",
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to send reset password email:", error);
    return { success: false, error };
  }
}
