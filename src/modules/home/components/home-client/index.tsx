"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Button } from "@medusajs/ui"
import { X } from "lucide-react"

interface PromoPopupProps {
  countryCode: string
}

const HomeClient = ({ countryCode }: PromoPopupProps) => {
  const [isVisible, setIsVisible] = useState(false)
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

  const handleClick = () => {
    setIsVisible(false)
    router.push(`/${countryCode}/seasons/season-1`)
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
          className="absolute -top-3 -right-3 bg-blue-600 rounded-full p-1 text-white hover:bg-blue-700 transition-colors z-10 shadow-lg"
          aria-label="Close popup"
        >
          <X size={20} />
        </button>
        
        {/* Banner image */}
        <div 
          className="relative cursor-pointer rounded-lg overflow-hidden shadow-xl" 
          onClick={handleClick}
        >
          <Image
            src="/assets/Banner.png"
            alt="Special Promotion"
            width={600}
            height={300}
            className="w-full h-auto"
            priority
          />
          
          {/* Optional overlay button */}
          <div className="absolute bottom-4 right-4">
            <Button 
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-1 text-sm rounded-full"
              onClick={handleClick}
            >
              View Offer
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HomeClient
