import {
  Body,
  Button,
  Container,
  Head,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface MagicLinkEmailProps {
  actionUrl: string;
  firstName: string;
  mailType: "login" | "register";
  siteName: string;
}

export const MagicLinkEmail = ({
  firstName = "",
  actionUrl,
  mailType,
  siteName,
}: MagicLinkEmailProps) => (
  <Html>
    <Head />
    <Preview>
      Click to {mailType === "login" ? "sign in" : "activate"} your {siteName}{" "}
      account.
    </Preview>
    <Body style={styles.body}>
      <Container style={styles.container}>
        <Text style={styles.title}>{siteName}</Text>
        <Text style={styles.text}>Hi {firstName || "there"},</Text>
        <Text style={styles.text}>
          Welcome to {siteName}! Click the button below to{" "}
          {mailType === "login" ? "sign in to" : "activate"} your account.
        </Text>
        <Section style={styles.buttonSection}>
          <Button style={styles.button} href={actionUrl}>
            {mailType === "login" ? "Sign in" : "Activate Account"}
          </Button>
        </Section>
        <Text style={styles.text}>
          This link expires in 5 minutes and can only be used once.
        </Text>
        {mailType === "login" ? (
          <Text style={styles.text}>
            If you did not try to log into your account, you can safely ignore
            this email.
          </Text>
        ) : null}
        <Hr style={styles.hr} />
        <Text style={styles.footer}>{siteName}</Text>
      </Container>
    </Body>
  </Html>
);

const styles = {
  body: {
    backgroundColor: "#ffffff",
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, sans-serif',
  },
  container: {
    margin: "0 auto",
    padding: "20px 0 48px",
    maxWidth: "560px",
  },
  title: {
    fontSize: "24px",
    fontWeight: "bold" as const,
    textAlign: "center" as const,
    margin: "0 0 20px",
  },
  text: {
    fontSize: "16px",
    lineHeight: "26px",
    color: "#333333",
  },
  buttonSection: {
    textAlign: "center" as const,
    margin: "32px 0",
  },
  button: {
    backgroundColor: "#18181b",
    borderRadius: "6px",
    color: "#ffffff",
    fontSize: "16px",
    fontWeight: "bold" as const,
    textDecoration: "none",
    textAlign: "center" as const,
    display: "inline-block",
    padding: "12px 24px",
  },
  hr: {
    borderColor: "#e5e5e5",
    margin: "20px 0",
  },
  footer: {
    fontSize: "12px",
    color: "#666666",
    textAlign: "center" as const,
  },
};

export default MagicLinkEmail;
