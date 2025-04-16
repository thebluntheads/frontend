"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Button } from "@medusajs/ui"
import { X } from "lucide-react"
import { addToCart } from "@lib/data/cart"

interface PromoPopupProps {
  countryCode: string
}

const HomeClient = ({ countryCode }: PromoPopupProps) => {
  const [isVisible, setIsVisible] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  // Check if the popup has been closed before
  useEffect(() => {
    const hasClosedPopup = localStorage.getItem("promoPopupClosed")

    // Only show popup if it hasn't been closed in this session
    if (!hasClosedPopup) {
      const timer = setTimeout(() => {
        setIsVisible(true)
      }, 1500) // 1.5 second delay

      return () => clearTimeout(timer)
    }
  }, [])

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsVisible(false)
    // Store that the user has closed the popup
    localStorage.setItem("promoPopupClosed", "true")
  }

  const handleAddToCartAndCheckout = async (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsLoading(true)

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

  if (!isVisible) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm transition-opacity"
      onClick={handleClose} // Close when clicking the backdrop
    >
      <div
        className="relative max-w-md w-full mx-4 animate-fade-in-up"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking the popup content
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute -top-3 -right-3 bg-dark-green rounded-full p-1 text-white hover:bg-light-green transition-colors z-10 shadow-lg"
          aria-label="Close popup"
        >
          <X size={20} />
        </button>

        {/* Banner image */}
        <div
          className="relative cursor-pointer rounded-lg overflow-hidden shadow-xl"
          onClick={handleAddToCartAndCheckout}
        >
          <Image
            src="/assets/Banner.jpeg"
            alt="Special Promotion"
            width={600}
            height={300}
            className="w-full h-auto"
            priority
          />

          {/* Overlay button */}
          <div className="absolute bottom-4 right-4">
            <Button
              className="bg-dark-green hover:bg-light-green text-white font-medium px-4 py-1 text-sm rounded-full"
              onClick={handleAddToCartAndCheckout}
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  <span>Adding...</span>
                </div>
              ) : (
                "Buy Now"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HomeClient
