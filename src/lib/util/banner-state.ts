import { headers } from 'next/headers'

/**
 * Gets the banner visibility state from cookies
 * @returns {boolean} Whether the banner is visible
 */
export function getBannerVisibility(): boolean {
  try {
    // Read the cookie from the Cookie header
    const headersList = headers()
    const cookieHeader = headersList.get('cookie') || ''
    
    // Parse the cookie string to find bannerVisible
    const cookies = parseCookies(cookieHeader)
    const bannerVisible = cookies['bannerVisible']
    
    // Default to true if cookie is not set
    if (bannerVisible === undefined) {
      return true
    }
    
    return bannerVisible === 'true'
  } catch (error) {
    // If there's any error reading cookies, default to true
    return true
  }
}

/**
 * Parse cookie string into an object
 */
function parseCookies(cookieHeader: string): Record<string, string> {
  const cookies: Record<string, string> = {}
  
  if (!cookieHeader) return cookies
  
  cookieHeader.split(';').forEach(cookie => {
    const [name, value] = cookie.trim().split('=')
    if (name && value) {
      cookies[name] = value
    }
  })
  
  return cookies
}
