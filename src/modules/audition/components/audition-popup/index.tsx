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

  // Show popup after 2 seconds
  useEffect(() => {
    // Check how many times the popup has been closed
    const closeCount = parseInt(
      localStorage.getItem("auditionPopupCloseCount") || "0"
    )

    // Only show if it has been closed less than 3 times
    if (closeCount < 3) {
      // Show popup after 2 seconds
      const timer = setTimeout(() => {
        setIsVisible(true)
      }, 2000)

      return () => clearTimeout(timer)
    }
  }, [])

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsVisible(false)

    // Increment and store close count
    const currentCloseCount = parseInt(
      localStorage.getItem("auditionPopupCloseCount") || "0"
    )
    const newCloseCount = currentCloseCount + 1
    localStorage.setItem("auditionPopupCloseCount", newCloseCount.toString())
  }

  const handleClick = () => {
    setIsVisible(false)

    // Increment and store close count
    const currentCloseCount = parseInt(
      localStorage.getItem("auditionPopupCloseCount") || "0"
    )
    const newCloseCount = currentCloseCount + 1
    localStorage.setItem("auditionPopupCloseCount", newCloseCount.toString())

    router.push(`/${countryCode}/audition`)
  }

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm transition-opacity top-10">
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
