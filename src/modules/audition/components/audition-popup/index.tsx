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

  // Show popup when user scrolls to the episode section
  useEffect(() => {
    // Check if the popup has been closed before
    const hasClosedPopup = localStorage.getItem("auditionPopupClosed")

    if (!hasClosedPopup) {
      const handleScroll = () => {
        // Find the episode section element by ID
        const episodeSection = document.getElementById("episodes-section")

        if (episodeSection) {
          const rect = episodeSection.getBoundingClientRect()
          // Check if the section is in the middle of the viewport
          const middleOfViewport = window.innerHeight / 2
          const elementMiddle = rect.top + rect.height / 2

          // Show popup when episode section is in the middle of the viewport
          if (Math.abs(elementMiddle - middleOfViewport) < 100) {
            setIsVisible(true)
            // Remove the scroll event listener once the popup is shown
            window.removeEventListener("scroll", handleScroll)
          }
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
    // Store that the user has closed the popup
    localStorage.setItem("auditionPopupClosed", "true")
    router.push(`/${countryCode}/audition`)
  }

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm transition-opacity">
      <div className="relative max-w-md w-full mx-4 animate-fade-in-up">
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
          onClick={handleClick}
        >
          <Image
            src="/assets/casting.jpg"
            alt="Audition Now"
            width={600}
            height={300}
            className="w-full h-auto"
            priority
          />
        </div>
      </div>
    </div>
  )
}

export default AuditionPopup
