import { DEFAULT_LOCALE, LANGUAGE_COOKIE, cookieConfig } from "./routing"

// Function to get the current locale from cookies (client-side only)
export function getLocale(): string {
  // Only run on client-side
  if (typeof window !== "undefined") {
    return (
      document.cookie
        .split("; ")
        .find((row) => row.startsWith(`${LANGUAGE_COOKIE}=`))
        ?.split("=")[1] || DEFAULT_LOCALE
    )
  }
  return DEFAULT_LOCALE
}

// Function to set the locale in cookies
export function setLocale(locale: string) {
  document.cookie = `${LANGUAGE_COOKIE}=${locale}; max-age=${
    cookieConfig.maxAge
  }; path=${cookieConfig.path}; samesite=${cookieConfig.sameSite}${
    cookieConfig.secure ? "; secure" : ""
  }`
  window.location.reload() // Reload to apply the new locale
}
