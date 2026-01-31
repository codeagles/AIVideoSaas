import type { BaseEmailProps } from "@/mail/types";
import EmailButton from "@/mail/components/email-button";
import EmailLayout from "@/mail/components/email-layout";
import { Text } from "@react-email/components";
import { createTranslator } from "use-intl/core";

interface WelcomeEmailProps extends BaseEmailProps {
  name?: string;
  appUrl?: string;
}

export default function WelcomeEmail({
  name = "there",
  appUrl = "https://videofly.app",
  locale,
  messages,
}: WelcomeEmailProps) {
  const t = createTranslator({
    locale,
    messages,
    namespace: "Mail.welcome",
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

      <Text className="mt-8 font-semibold text-gray-900">{t("features")}</Text>
      <Text className="ml-5 text-base text-gray-700">
        • {t("featuresList.generate")}
      </Text>
      <Text className="ml-5 text-base text-gray-700">
        • {t("featuresList.models")}
      </Text>
      <Text className="ml-5 text-base text-gray-700">
        • {t("featuresList.share")}
      </Text>

      <EmailButton href={`${appUrl}?utm_source=transactional&utm_medium=email&utm_campaign=welcome`}>
        {t("cta")}
      </EmailButton>

      <Text className="mt-8 text-sm text-gray-600">{t("footer")}</Text>
    </EmailLayout>
  );
}

// Preview props for react-email CLI
WelcomeEmail.PreviewProps = {
  locale: "en",
  messages: {
    Mail: {
      common: {
        team: "{name} Team",
        copyright: "© {year} All Rights Reserved.",
      },
      welcome: {
        greeting: "Hi {name},",
        title: "Welcome to VideoFly!",
        body: "Thank you for joining VideoFly! We're thrilled to have you on board.",
        features: "With VideoFly, you can:",
        featuresList: {
          generate: "Generate stunning AI videos in minutes",
          models: "Use multiple AI models like Sora 2, Veo 3.1, and more",
          share: "Download and share your creations anywhere",
        },
        cta: "Start Creating Videos",
        footer: "If you have any questions, feel free to reach out to our support team.",
      },
    },
  },
  name: "John Doe",
  appUrl: "https://videofly.app",
};
