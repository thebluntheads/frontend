"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Button } from "@medusajs/ui"
import { X } from "lucide-react"

interface PromoPopupProps {
  imageUrl: string
  linkUrl: string
  delay?: number // Delay in milliseconds before showing the popup
}

const PromoPopup = ({
  imageUrl = "/assets/Banner.png",
  linkUrl = "/us/seasons/season-1",
  delay = 1500,
}: PromoPopupProps) => {
  const [isVisible, setIsVisible] = useState(false)
  const router = useRouter()

  // Check if the popup has been closed before
  useEffect(() => {
    const hasClosedPopup = localStorage.getItem("promoPopupClosed")
    
    // Only show popup if it hasn't been closed in this session
    if (!hasClosedPopup) {
      const timer = setTimeout(() => {
        setIsVisible(true)
      }, delay)
      
      return () => clearTimeout(timer)
    }
  }, [delay])

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsVisible(false)
    // Store that the user has closed the popup
    localStorage.setItem("promoPopupClosed", "true")
  }

  const handleClick = () => {
    setIsVisible(false)
    router.push(linkUrl)
  }

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm transition-opacity">
      <div className="relative max-w-2xl w-full mx-4 animate-fade-in-up">
        {/* Close button */}
        <button 
          onClick={handleClose}
          className="absolute -top-4 -right-4 bg-blue-600 rounded-full p-1 text-white hover:bg-blue-700 transition-colors z-10"
          aria-label="Close popup"
        >
          <X size={24} />
        </button>
        
        {/* Banner image */}
        <div 
          className="relative cursor-pointer rounded-lg overflow-hidden shadow-2xl" 
          onClick={handleClick}
        >
          <Image
            src={imageUrl}
            alt="Special Promotion"
            width={800}
            height={400}
            className="w-full h-auto"
            priority
          />
          
          {/* Optional overlay button */}
          <div className="absolute bottom-6 right-6">
            <Button 
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2 rounded-full"
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

export default PromoPopup
