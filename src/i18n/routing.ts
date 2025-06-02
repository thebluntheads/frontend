// Define supported locales for the application
export const supportedLocales = [
  "es",
  "pt",
  "fr",
  "de",
  "ko",
  "ja",
  "hi",
  "en",
  "ar",
  "zh",
]

// Cookie name for storing the selected language
export const LANGUAGE_COOKIE = "NEXT_LOCALE"

// Default locale if none is specified
export const DEFAULT_LOCALE = "en"

// Cookie configuration
export const cookieConfig = {
  // Expire in one year
  maxAge: 60 * 60 * 24 * 365,
  // Use across the entire site
  path: "/",
  // Send only in HTTP requests, not accessible via JavaScript
  httpOnly: false,
  // Only send over HTTPS in production
  secure: process.env.NODE_ENV === "production",
  // Prevent CSRF
  sameSite: "strict" as const,
}
