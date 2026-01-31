import {
  Body,
  Button,
  Container,
  Head,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import { ReactNode } from "react";

interface WelcomeEmailProps {
  name?: string;
  locale?: string;
  translations: {
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
  appUrl?: string;
}

export const WelcomeEmail = ({
  name = "",
  locale = "en",
  translations,
  appUrl = "https://videofly.app",
}: WelcomeEmailProps) => {
  const currentYear = new Date().getFullYear();

  return (
    <Html>
      <Head />
      <Preview>{translations.subject}</Preview>
      <Body
        style={{
          backgroundColor: "#ffffff",
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, sans-serif',
        }}
      >
        <Container
          style={{
            margin: "0 auto",
            padding: "20px 0 48px",
            maxWidth: "560px",
          }}
        >
          {/* Logo or Brand */}
          <Section style={{ textAlign: "center", marginBottom: "32px" }}>
            <Text
              style={{
                fontSize: "28px",
                fontWeight: "bold",
                color: "#18181b",
              }}
            >
              VideoFly
            </Text>
          </Section>

          {/* Greeting */}
          <Text style={{ fontSize: "16px", lineHeight: "26px", color: "#333333" }}>
            {translations.greeting.replace("{name}", name || "there")}
          </Text>

          {/* Title */}
          <Text
            style={{
              fontSize: "24px",
              fontWeight: "bold",
              marginTop: "32px",
              marginBottom: "16px",
              color: "#18181b",
            }}
          >
            {translations.title}
          </Text>

          {/* Body */}
          <Text style={{ fontSize: "16px", lineHeight: "26px", color: "#333333" }}>
            {translations.body}
          </Text>

          {/* Features */}
          <Section style={{ marginTop: "32px", marginBottom: "32px" }}>
            <Text
              style={{
                fontSize: "16px",
                fontWeight: "600",
                marginBottom: "16px",
                color: "#333333",
              }}
            >
              {translations.features}
            </Text>
            <div
              style={{
                marginLeft: "20px",
                color: "#555555",
              }}
            >
              <Text
                style={{
                  fontSize: "15px",
                  lineHeight: "24px",
                  display: "block",
                  marginBottom: "8px",
                }}
              >
                • {translations.featuresList.generate}
              </Text>
              <Text
                style={{
                  fontSize: "15px",
                  lineHeight: "24px",
                  display: "block",
                  marginBottom: "8px",
                }}
              >
                • {translations.featuresList.models}
              </Text>
              <Text
                style={{
                  fontSize: "15px",
                  lineHeight: "24px",
                  display: "block",
                }}
              >
                • {translations.featuresList.share}
              </Text>
            </div>
          </Section>

          {/* CTA Button */}
          <Section style={{ textAlign: "center", margin: "40px 0" }}>
            <Button
              style={{
                backgroundColor: "#18181b",
                borderRadius: "8px",
                color: "#ffffff",
                fontSize: "16px",
                fontWeight: "bold",
                textDecoration: "none",
                textAlign: "center",
                display: "inline-block",
                padding: "14px 28px",
              }}
              href={`${appUrl}?utm_source=transactional&utm_medium=email&utm_campaign=welcome`}
            >
              {translations.cta}
            </Button>
          </Section>

          {/* Footer Text */}
          <Text
            style={{
              fontSize: "14px",
              lineHeight: "22px",
              color: "#666666",
              marginBottom: "8px",
            }}
          >
            {translations.footer}
          </Text>

          <Hr
            style={{
              borderColor: "#e5e5e5",
              margin: "24px 0",
            }}
          />

          {/* Copyright */}
          <Text
            style={{
              fontSize: "12px",
              color: "#999999",
              textAlign: "center",
            }}
          >
            {translations.copyright.replace("{year}", String(currentYear))}
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default WelcomeEmail;
