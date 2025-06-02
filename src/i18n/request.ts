import { getRequestConfig } from "next-intl/server"
import { cookies } from "next/headers"
import { DEFAULT_LOCALE, LANGUAGE_COOKIE } from "./routing"

export default getRequestConfig(async () => {
  // Get locale from cookie or use default
  let locale = DEFAULT_LOCALE
  
  try {
    // Try to get the locale from the cookie
    const cookieStore = await cookies()
    const localeCookie = cookieStore.get(LANGUAGE_COOKIE)
    if (localeCookie) {
      locale = localeCookie.value
    }
  } catch (error) {
    console.error('Error reading locale cookie:', error)
    // Fallback to default locale
  }

  // Load messages for the current locale
  let messages
  try {
    messages = (await import(`../lib/messages/${locale}.json`)).default
  } catch (e) {
    console.error(`Failed to load messages for locale ${locale}:`, e)
    // Fallback to default locale if translation file is missing
    messages = (await import(`../lib/messages/${DEFAULT_LOCALE}.json`)).default
  }

  return {
    locale,
    messages,
    timeZone: 'UTC'
  }
})
