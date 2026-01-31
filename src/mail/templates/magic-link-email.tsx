import type { BaseEmailProps } from "@/mail/types";
import EmailButton from "@/mail/components/email-button";
import EmailLayout from "@/mail/components/email-layout";
import { Text } from "@react-email/components";
import { createTranslator } from "use-intl/core";

interface MagicLinkEmailProps extends BaseEmailProps {
  name?: string;
  magicLink: string;
}

export default function MagicLinkEmail({
  name = "there",
  magicLink,
  locale,
  messages,
}: MagicLinkEmailProps) {
  const t = createTranslator({
    locale,
    messages,
    namespace: "Mail.magicLink",
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

      <EmailButton href={magicLink}>{t("button")}</EmailButton>

      <Text className="mt-8 text-sm text-gray-500">{t("validity")}</Text>
      <Text className="mt-4 text-sm text-gray-500">{t("security")}</Text>
      <Text className="mt-4 text-sm text-gray-500">{t("footer")}</Text>
    </EmailLayout>
  );
}

// Preview props for react-email CLI
MagicLinkEmail.PreviewProps = {
  locale: "en",
  messages: {
    Mail: {
      common: {
        team: "{name} Team",
        copyright: "© {year} All Rights Reserved.",
      },
      magicLink: {
        greeting: "Hi {name},",
        title: "Sign In to VideoFly",
        body: "We received a request to sign in to your VideoFly account.",
        instruction: "Click the button below to sign in:",
        button: "Sign In",
        validity: "This link will expire in 24 hours.",
        security: "For your security, this link can only be used once.",
        footer: "If you didn't request this, please ignore this email.",
      },
    },
  },
  name: "John Doe",
  magicLink: "https://videofly.app/auth/callback?token=abc123",
};
