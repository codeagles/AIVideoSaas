import type { BaseEmailProps } from "@/mail/types";
import EmailButton from "@/mail/components/email-button";
import EmailLayout from "@/mail/components/email-layout";
import { Section, Text } from "@react-email/components";
import { createTranslator } from "use-intl/core";

interface ResetPasswordEmailProps extends BaseEmailProps {
  name?: string;
  resetUrl: string;
}

export default function ResetPasswordEmail({
  name = "there",
  resetUrl,
  locale,
  messages,
}: ResetPasswordEmailProps) {
  const t = createTranslator({
    locale,
    messages,
    namespace: "Mail.resetPassword",
  });

  return (
    <EmailLayout locale={locale} messages={messages}>
      <Text className="text-base text-gray-900">
        {t("greeting", { name })}
      </Text>
      <Text className="mt-8 text-2xl font-bold text-gray-900">
        {t("title")}
      </Text>
      <Text className="text-base text-gray-900">{t("body")}</Text>
      <Text className="text-base text-gray-900">{t("instruction")}</Text>

      <EmailButton href={resetUrl}>{t("button")}</EmailButton>

      <Section className="mt-8 rounded-lg bg-gray-100 p-4">
        <Text className="text-sm text-gray-700">{t("validity")}</Text>
        <Text className="text-sm text-gray-600">{t("security")}</Text>
      </Section>

      <Text className="mt-8 text-sm text-gray-500">{t("ignore")}</Text>
      <Text className="text-sm text-gray-500">{t("footer")}</Text>
    </EmailLayout>
  );
}

// Preview props for react-email CLI
ResetPasswordEmail.PreviewProps = {
  locale: "en",
  messages: {
    Mail: {
      common: {
        team: "{name} Team",
        copyright: "© {year} All Rights Reserved.",
      },
      resetPassword: {
        greeting: "Hi {name},",
        title: "Reset Your Password",
        body: "We received a request to reset your password for your VideoFly account.",
        instruction: "Click the button below to reset your password:",
        button: "Reset Password",
        validity: "This link will expire in 30 minutes and can only be used once.",
        security: "For security reasons, this link expires after 30 minutes.",
        ignore: "If you did not request a password reset, you can safely ignore this email.",
        footer: "If you didn't request this, please ignore this email.",
      },
    },
  },
  name: "John Doe",
  resetUrl: "https://videofly.app/reset-password?token=abc123",
};
