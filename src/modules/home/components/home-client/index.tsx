"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Button } from "@medusajs/ui"
import { X } from "lucide-react"
import { addToCart } from "@lib/data/cart"
import { retrieveCustomer } from "@lib/data/customer"
import { getCookie, setCookie } from "cookies-next"
import AuditionPopup from "@modules/audition/components/audition-popup"

interface PromoPopupProps {
  countryCode: string
}

const HomeClient = ({ countryCode }: PromoPopupProps) => {
  const [isVisible, setIsVisible] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showAgeVerification, setShowAgeVerification] = useState(false)
  const [isAgeVerified, setIsAgeVerified] = useState<boolean | null>(null)
  const router = useRouter()

  // Check if age has been verified before
  useEffect(() => {
    const ageVerified = getCookie("ageVerified")
    const localAgeVerified = localStorage.getItem("ageVerified")

    // Check both cookie and localStorage for backward compatibility
    if (ageVerified === "true" || localAgeVerified === "true") {
      setIsAgeVerified(true)
      // Ensure both storage methods are in sync
      localStorage.setItem("ageVerified", "true")
      setCookie("ageVerified", "true", { maxAge: 60 * 60 * 24 * 30, path: "/" })
      checkPromoPopup()
    } else if (ageVerified === "false" || localAgeVerified === "false") {
      setIsAgeVerified(false)
      router.push(`/${countryCode}/restricted`)
    } else {
      // Show age verification if not verified yet
      const timer = setTimeout(() => {
        setShowAgeVerification(true)
      }, 500) // 0.5 second delay

      return () => clearTimeout(timer)
    }
  }, [countryCode, router])

  // Check if the promo popup has been closed before
  const checkPromoPopup = () => {
    // Temporarily commented out promo popup
    /*
    const hasClosedPopup = localStorage.getItem("promoPopupClosed")

    // Only show popup if it hasn't been closed in this session
    if (!hasClosedPopup) {
      const timer = setTimeout(() => {
        setIsVisible(true)
      }, 1000) // 1 second delay

      return () => clearTimeout(timer)
    }
    */
  }

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsVisible(false)
    // Store that the user has closed the popup
    localStorage.setItem("promoPopupClosed", "true")
  }

  const handleAgeVerification = (isOver18: boolean) => {
    setIsAgeVerified(isOver18)

    // Store in both localStorage and cookie
    localStorage.setItem("ageVerified", isOver18.toString())
    setCookie("ageVerified", isOver18.toString(), {
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
    })

    if (isOver18) {
      setShowAgeVerification(false)
      checkPromoPopup()
    } else {
      // Redirect to restricted page
      router.push(`/${countryCode}/restricted`)
    }
  }

  const handleAddToCartAndCheckout = async (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsLoading(true)
    const customer = await retrieveCustomer()

    if (!customer) {
      return router.push(`/${countryCode}/account?callbackUrl=/${countryCode}`)
    }

    try {
      // Add first item to cart
      await addToCart({
        variantId: "variant_01JRVR3PRSEV42K0Q9KKN9WX94",
        quantity: 1,
        countryCode,
      })

      // Add second item to cart
      await addToCart({
        variantId: "variant_01JRVTERWFJQ9HXWZP17H13HXT",
        quantity: 1,
        countryCode,
      })

      // Close popup and redirect to checkout
      setIsVisible(false)
      router.push(`/${countryCode}/checkout`)
    } catch (error) {
      console.error("Error adding items to cart:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Age verification popup
  if (showAgeVerification && isAgeVerified === null) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm transition-opacity">
        <div className="relative max-w-md w-full mx-4 animate-fade-in-up bg-gray-800/80 backdrop-blur-md rounded-xl overflow-hidden shadow-2xl border border-gray-700/50">
          <div className="flex flex-col items-center p-8">
            {/* Rounded image */}
            <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-dark-green -mt-4 mb-6">
              <Image
                src="/assets/preview.png"
                alt="The Blunt Heads"
                fill
                className="object-cover"
                priority
              />
            </div>

            <h2 className="text-2xl font-bold text-white mb-2">
              Are you 18 or older?
            </h2>
            <p className="text-gray-300 text-center mb-8">
              You must be{" "}
              <span className="text-light-green font-semibold">18</span> or
              older to access The Blunt Heads. Are you over 18 years old?
            </p>

            <div className="flex gap-4 w-full">
              <Button
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-medium py-2"
                onClick={() => handleAgeVerification(false)}
              >
                No, I'm not
              </Button>
              <Button
                className="flex-1 bg-dark-green hover:bg-light-green text-white font-medium py-2"
                onClick={() => handleAgeVerification(true)}
              >
                Yes, I am
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Return the new audition popup and age verification instead of the promo popup
  return <>{/* <AuditionPopup countryCode={countryCode} /> */}</>
}

export default HomeClient
