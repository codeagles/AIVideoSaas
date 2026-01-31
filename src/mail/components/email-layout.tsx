import type { BaseEmailProps } from "@/mail/types";
import {
  Body,
  Container,
  Font,
  Head,
  Hr,
  Html,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";
import { createTranslator } from "use-intl/core";

interface EmailLayoutProps extends BaseEmailProps {
  children: React.ReactNode;
}

/**
 * Email Layout
 *
 * Uses Tailwind CSS for styling - https://react.email/docs/components/tailwind
 *
 * IMPORTANT: Tailwind must wrap Html/Head for proper style injection
 */
export default function EmailLayout({
  locale,
  messages,
  children,
}: EmailLayoutProps) {
  const t = createTranslator({
    locale,
    messages,
    namespace: "Mail.common",
  });

  return (
    <Tailwind>
      <Html lang={locale}>
        <Head>
          <Font
            fontFamily="Inter"
            fallbackFontFamily="Arial"
            fontWeight={400}
            fontStyle="normal"
          />
        </Head>
        <Body className="bg-white">
          <Section className="bg-white px-4 py-8">
            <Container className="mx-auto max-w-[560px] rounded-lg bg-white px-6 py-8 text-gray-900">
              {/* Logo/Brand */}
              <Text className="mb-8 text-center text-2xl font-bold text-gray-900">
                VideoFly
              </Text>

              {children}

              <Hr className="my-8 border-gray-200" />
              <Text className="mt-4 text-sm text-gray-600">
                {t("team", { name: "VideoFly" })}
              </Text>
              <Text className="text-sm text-gray-500">
                {t("copyright", { year: new Date().getFullYear() })}
              </Text>
            </Container>
          </Section>
        </Body>
      </Html>
    </Tailwind>
  );
}
