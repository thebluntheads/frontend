"use client"

import LocalizedClientLink from "@modules/common/components/localized-client-link"

export default function AuditionBanner() {

  return (
    <div className="bg-gradient-to-r from-dark-green to-light-green text-white py-1.5 sm:py-3 relative z-50 shadow-md">
      <div className="container mx-auto px-4 flex items-center justify-center">
        <LocalizedClientLink
          href="/audition"
          className="flex items-center justify-center text-center font-medium text-xs sm:text-base hover:underline"
        >
          <span className="mr-1.5 sm:mr-2 text-base sm:text-xl">🎬</span>
          <span className="font-bold">Voice Actor Casting Call</span>
          <span className="mx-1.5 sm:mx-2">–</span>
          <span className="underline font-medium">Tap to Audition!</span>
        </LocalizedClientLink>
      </div>
    </div>
  )
}
