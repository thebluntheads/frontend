import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Section,
  Text,
} from "@react-email/components"

export interface AuditionConfirmationEmailProps {
  name: string
  email: string
  instagram: string
  tiktok: string
  character: string
  characterScript: string
  videoLink: string
}

export default function AuditionConfirmationEmail({
  name,
  email,
  instagram,
  tiktok,
  character,
  characterScript,
  videoLink,
}: AuditionConfirmationEmailProps) {
  // Apple TV-like design colors
  const colors = {
    background: "#000000",
    text: "#FFFFFF",
    accent: "#61C65F", // Light green
    secondary: "#86868B",
    divider: "#333333",
    cardBg: "#1C1C1E",
    welcomeBg: "#1C1C1E",
    welcomeAccent: "#057E03", // Dark green accent for welcome emails
  }

  return (
    <Html>
      <Head />
      <Body
        style={{
          backgroundColor: colors.background,
          color: colors.text,
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
          margin: 0,
          padding: 0,
        }}
      >
        <Container
          style={{
            maxWidth: "600px",
            margin: "0 auto",
            padding: "40px 20px",
          }}
        >
          {/* Header */}
          <Section style={{ textAlign: "center", marginBottom: "32px" }}>
            <Img
              src="https://www.thebluntheads.com/assets/logo.png"
              alt="The Blunt Heads Logo"
              width="55%"
              height="auto"
              style={{ margin: "0 auto 16px" }}
            />
            <Heading
              style={{
                fontSize: "28px",
                fontWeight: "500",
                color: colors.text,
                margin: "0 0 8px",
                letterSpacing: "-0.5px",
              }}
            >
              Your Audition Has Been Received!
            </Heading>
          </Section>

          {/* Applicant Info Card */}
          <Section
            style={{
              backgroundColor: colors.welcomeBg,
              borderRadius: "16px",
              padding: "24px",
              marginBottom: "32px",
              boxShadow: "0 2px 10px rgba(0, 0, 0, 0.3)",
              border: `1px solid ${colors.welcomeAccent}40`,
            }}
          >
            <Text
              style={{
                fontSize: "18px",
                fontWeight: "500",
                marginTop: 0,
                marginBottom: "16px",
                color: colors.welcomeAccent,
              }}
            >
              Applicant Information
            </Text>

            <Text
              style={{
                fontSize: "16px",
                lineHeight: "1.5",
                margin: "0 0 8px",
                color: colors.text,
              }}
            >
              <strong>Name:</strong>{" "}
              <span style={{ color: colors.accent }}>{name}</span>
            </Text>

            <Text
              style={{
                fontSize: "16px",
                lineHeight: "1.5",
                margin: "0 0 8px",
                color: colors.text,
              }}
            >
              <strong>Email:</strong>{" "}
              <span style={{ color: colors.accent }}>{email}</span>
            </Text>

            <Text
              style={{
                fontSize: "16px",
                lineHeight: "1.5",
                margin: "0 0 8px",
                color: colors.text,
              }}
            >
              <strong>Instagram:</strong>{" "}
              <span style={{ color: colors.accent }}>{instagram}</span>
            </Text>

            <Text
              style={{
                fontSize: "16px",
                lineHeight: "1.5",
                margin: "0 0 8px",
                color: colors.text,
              }}
            >
              <strong>TikTok:</strong>{" "}
              <span style={{ color: colors.accent }}>{tiktok}</span>
            </Text>
          </Section>

          {/* Audition Details Card */}
          <Section
            style={{
              backgroundColor: colors.cardBg,
              borderRadius: "16px",
              padding: "24px",
              marginBottom: "32px",
              boxShadow: "0 2px 10px rgba(0, 0, 0, 0.3)",
            }}
          >
            <Text
              style={{
                fontSize: "18px",
                fontWeight: "500",
                marginTop: 0,
                marginBottom: "16px",
                color: colors.text,
              }}
            >
              Audition Details
            </Text>

            <Text
              style={{
                fontSize: "16px",
                lineHeight: "1.5",
                margin: "0 0 16px",
                color: colors.text,
              }}
            >
              <strong>Character:</strong>{" "}
              <span style={{ color: colors.accent }}>{character}</span>
            </Text>

            <Text
              style={{
                fontSize: "16px",
                lineHeight: "1.5",
                margin: "0 0 8px",
                color: colors.text,
              }}
            >
              <strong>Character Script:</strong>
            </Text>

            <Text
              style={{
                fontSize: "15px",
                lineHeight: "1.5",
                margin: "0 0 16px",
                color: colors.secondary,
                padding: "12px",
                backgroundColor: "#2C2C2E",
                borderRadius: "8px",
                fontStyle: "italic",
              }}
            >
              {characterScript}
            </Text>

            <Text
              style={{
                fontSize: "16px",
                lineHeight: "1.5",
                margin: "16px 0 8px",
                color: colors.text,
              }}
            >
              <strong>Video Link:</strong>
            </Text>

            <Text
              style={{
                fontSize: "15px",
                lineHeight: "1.5",
                margin: "0",
                color: colors.secondary,
                padding: "12px",
                backgroundColor: "#2C2C2E",
                borderRadius: "8px",
              }}
            >
              {videoLink}
            </Text>
          </Section>

          {/* Footer */}
          <Section style={{ textAlign: "center" }}>
            <Text
              style={{
                fontSize: "14px",
                color: colors.secondary,
                margin: "0 0 8px",
                lineHeight: "1.5",
              }}
            >
              This is an automated email from The Blunt Heads audition system.
            </Text>
            <Text
              style={{
                fontSize: "14px",
                color: colors.secondary,
                margin: "0",
              }}
            >
              © {new Date().getFullYear()} The Blunt Heads. All rights reserved.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}
