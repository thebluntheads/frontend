"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { X } from "lucide-react"

interface AuditionPopupProps {
  countryCode: string
}

const AuditionPopup = ({ countryCode }: AuditionPopupProps) => {
  const [isVisible, setIsVisible] = useState(false)
  const router = useRouter()
  
  // Track scroll count and show popup after 3 scrolls
  useEffect(() => {
    // Check if the popup has been closed before
    const hasClosedPopup = localStorage.getItem("auditionPopupClosed")
    
    if (!hasClosedPopup) {
      let scrollCount = 0
      
      const handleScroll = () => {
        scrollCount++
        
        if (scrollCount >= 3) {
          setIsVisible(true)
          // Remove the scroll event listener once the popup is shown
          window.removeEventListener("scroll", handleScroll)
        }
      }
      
      // Add scroll event listener
      window.addEventListener("scroll", handleScroll)
      
      // Clean up the event listener
      return () => {
        window.removeEventListener("scroll", handleScroll)
      }
    }
  }, [])
  
  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsVisible(false)
    // Store that the user has closed the popup
    localStorage.setItem("auditionPopupClosed", "true")
  }
  
  const handleClick = () => {
    setIsVisible(false)
    router.push(`/${countryCode}/audition`)
  }
  
  if (!isVisible) return null
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm transition-opacity">
      <div className="relative max-w-2xl w-full mx-4 animate-fade-in-up">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute -top-4 -right-4 bg-dark-green rounded-full p-1 text-white hover:bg-light-green transition-colors z-10"
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
            src="/assets/casting.jpg"
            alt="Audition Now"
            width={800}
            height={400}
            className="w-full h-auto"
            priority
          />
          
          {/* Overlay button */}
          <div className="absolute bottom-6 right-6">
            <button
              className="bg-dark-green hover:bg-light-green text-white font-medium px-6 py-3 rounded-full transition-colors"
              onClick={handleClick}
            >
              Audition Now
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AuditionPopup
