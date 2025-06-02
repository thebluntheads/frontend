import { HttpTypes } from "@medusajs/types"
import { NextRequest, NextResponse } from "next/server"
import {
  DEFAULT_LOCALE,
  LANGUAGE_COOKIE,
  supportedLocales,
} from "./i18n/routing"
import createMiddleware from "next-intl/middleware"

const BACKEND_URL = process.env.MEDUSA_BACKEND_URL
const PUBLISHABLE_API_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
const DEFAULT_REGION = process.env.NEXT_PUBLIC_DEFAULT_REGION || "us"

const regionMapCache = {
  regionMap: new Map<string, HttpTypes.StoreRegion>(),
  regionMapUpdated: Date.now(),
}

async function getRegionMap(cacheId: string) {
  const { regionMap, regionMapUpdated } = regionMapCache

  if (!BACKEND_URL) {
    throw new Error(
      "Middleware.ts: Error fetching regions. Did you set up regions in your Medusa Admin and define a MEDUSA_BACKEND_URL environment variable? Note that the variable is no longer named NEXT_PUBLIC_MEDUSA_BACKEND_URL."
    )
  }

  if (
    !regionMap.keys().next().value ||
    regionMapUpdated < Date.now() - 3600 * 1000
  ) {
    // Fetch regions from Medusa. We can't use the JS client here because middleware is running on Edge and the client needs a Node environment.
    const { regions } = await fetch(`${BACKEND_URL}/store/regions`, {
      headers: {
        "x-publishable-api-key": PUBLISHABLE_API_KEY!,
      },
      next: {
        revalidate: 3600,
        tags: [`regions-${cacheId}`],
      },
      cache: "force-cache",
    }).then(async (response) => {
      const json = await response.json()

      if (!response.ok) {
        throw new Error(json.message)
      }

      return json
    })

    if (!regions?.length) {
      throw new Error(
        "No regions found. Please set up regions in your Medusa Admin."
      )
    }

    // Create a map of country codes to regions.
    regions.forEach((region: HttpTypes.StoreRegion) => {
      region.countries?.forEach((c) => {
        regionMapCache.regionMap.set(c.iso_2 ?? "", region)
      })
    })

    regionMapCache.regionMapUpdated = Date.now()
  }

  return regionMapCache.regionMap
}

/**
 * Fetches regions from Medusa and sets the region cookie.
 * @param request
 * @param response
 */
async function getCountryCode(
  request: NextRequest,
  regionMap: Map<string, HttpTypes.StoreRegion | number>
) {
  try {
    let countryCode

    const vercelCountryCode = request.headers
      .get("x-vercel-ip-country")
      ?.toLowerCase()

    const urlCountryCode = request.nextUrl.pathname.split("/")[1]?.toLowerCase()

    if (urlCountryCode && regionMap.has(urlCountryCode)) {
      countryCode = urlCountryCode
    } else if (vercelCountryCode && regionMap.has(vercelCountryCode)) {
      countryCode = vercelCountryCode
    } else if (regionMap.has(DEFAULT_REGION)) {
      countryCode = DEFAULT_REGION
    } else if (regionMap.keys().next().value) {
      countryCode = regionMap.keys().next().value
    }

    return countryCode
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error(
        "Middleware.ts: Error getting the country code. Did you set up regions in your Medusa Admin and define a MEDUSA_BACKEND_URL environment variable? Note that the variable is no longer named NEXT_PUBLIC_MEDUSA_BACKEND_URL."
      )
    }
  }
}

/**
 * Create the next-intl middleware for handling localization
 */
const intlMiddleware = createMiddleware({
  // A list of all locales that are supported
  locales: supportedLocales,
  // Used when no locale matches
  defaultLocale: DEFAULT_LOCALE,
  // Don't use URL-based locale detection
  localePrefix: "never",
  // Use cookies for locale detection
  localeDetection: true
})

/**
 * Middleware to handle region selection, onboarding status, age verification, and 404 redirects.
 * Also handles internationalization with next-intl.
 */
export const middleware = async (request: NextRequest) => {
  // Run the request through next-intl middleware first to handle locale
  const intlResponse = await intlMiddleware(request)
  
  // Check for age verification cookie
  const ageVerifiedCookie = request.cookies.get("ageVerified")
  const isAgeVerified = ageVerifiedCookie?.value === "true"

  // Get current path segments
  const pathSegments = request.nextUrl.pathname.split("/")
  const countryCodeFromUrl = pathSegments[1]?.toLowerCase()

  // Check if the current path is the restricted page
  const isRestrictedPage =
    pathSegments.length > 2 && pathSegments[2] === "restricted"

  // If age verification is false and not already on restricted page, redirect to restricted
  if (ageVerifiedCookie?.value === "false" && !isRestrictedPage) {
    const restrictedUrl = `${request.nextUrl.origin}/${countryCodeFromUrl}/restricted`
    const restrictedResponse = NextResponse.redirect(restrictedUrl, 307)
    
    // Copy locale cookie to the redirect response
    const localeCookie = intlResponse.cookies.get(LANGUAGE_COOKIE)
    if (localeCookie) {
      restrictedResponse.cookies.set(LANGUAGE_COOKIE, localeCookie.value, {
        path: '/',
        sameSite: 'strict'
      })
    }
    
    return restrictedResponse
  }

  // Continue with normal region handling
  let redirectUrl = request.nextUrl.href
  let response = NextResponse.redirect(redirectUrl, 307)
  let cacheIdCookie = request.cookies.get("_medusa_cache_id")
  let cacheId = cacheIdCookie?.value || crypto.randomUUID()

  const regionMap = await getRegionMap(cacheId)
  const countryCode = regionMap && (await getCountryCode(request, regionMap))

  const urlHasCountryCode =
    countryCode && request.nextUrl.pathname.split("/")[1].includes(countryCode)

  // check if the url is a static asset
  if (request.nextUrl.pathname.includes(".")) {
    return NextResponse.next()
  }

  // if one of the country codes is in the url and the cache id is set, continue with 404 check
  if (urlHasCountryCode && cacheIdCookie) {
    // Create a final response that will be our response
    const finalResponse = NextResponse.next()
    
    // Copy ALL cookies from the intl middleware response to our final response
    // This ensures we don't lose the locale cookie
    intlResponse.cookies.getAll().forEach(cookie => {
      finalResponse.cookies.set(cookie.name, cookie.value, {
        path: cookie.path || '/',
        sameSite: cookie.sameSite || 'strict'
      })
    })
    
    // Return the final response with all cookies preserved
    return finalResponse
  }

  // if one of the country codes is in the url and the cache id is not set, set the cache id and redirect
  if (urlHasCountryCode && !cacheIdCookie) {
    const newResponse = NextResponse.redirect(request.nextUrl.href, 307)
    
    newResponse.cookies.set("_medusa_cache_id", cacheId, {
      maxAge: 60 * 60 * 24,
    })
    
    // Copy locale cookie to the new response
    const localeCookie = intlResponse.cookies.get(LANGUAGE_COOKIE)
    if (localeCookie) {
      newResponse.cookies.set(LANGUAGE_COOKIE, localeCookie.value, {
        path: '/',
        sameSite: 'strict'
      })
    }

    return newResponse
  }

  const redirectPath =
    request.nextUrl.pathname === "/" ? "" : request.nextUrl.pathname

  const queryString = request.nextUrl.search ? request.nextUrl.search : ""

  // If no country code is set, we redirect to the relevant region.
  if (!urlHasCountryCode && countryCode) {
    redirectUrl = `${request.nextUrl.origin}/${countryCode}${redirectPath}${queryString}`
    response = NextResponse.redirect(`${redirectUrl}`, 307)
  }

  return response
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|images|assets|png|svg|jpg|jpeg|gif|webp|\\.well-known).*)",
  ],
}
