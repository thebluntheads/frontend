"use client"

import { Button } from "@medusajs/ui"
import Image from "next/image"
import { useState, useRef, useEffect } from "react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import CircularPlayButton from "../circular-play-button"
import { useTranslations, useLocale } from "next-intl"
import LanguageSelect from "@modules/layout/components/language-select"
import MuxVideoPlayer from "@modules/common/components/mux-player"
import { useCustomer } from "@lib/hooks/use-customer"

interface HeroProps {
  title?: string
  description?: string
  ctaLink?: string
  ctaText?: string
  thumbnailUrl?: string
  videoUrl?: string
  muxPlaybackId?: string
  episodeCount?: number
  seasonHandle?: string
  isEpisodePage?: boolean
}

const Hero = ({
  title = "Season Title",
  description = "Experience the journey through captivating episodes and exclusive content.",
  ctaLink,
  ctaText = "Watch Season",
  thumbnailUrl = "/assets/preview.png",
  videoUrl,
  muxPlaybackId,
  episodeCount = 0,
  seasonHandle,
  isEpisodePage = false,
}: HeroProps = {}) => {
  const t = useTranslations()
  const locale = useLocale()
  const { customer } = useCustomer()
  const [isPlaying, setIsPlaying] = useState(false)
  const videoContainerRef = useRef<HTMLDivElement>(null)
  const [visitorId, setVisitorId] = useState<string>("")

  // Generate a unique visitor ID using browser fingerprinting and store in localStorage
  useEffect(() => {
    // Function to generate a simple fingerprint based on browser information
    const generateBrowserFingerprint = () => {
      if (typeof window === "undefined") return "visitor"

      const nav = window.navigator
      const screen = window.screen

      // Combine various browser properties to create a unique identifier
      const fingerprint = [
        nav.userAgent,
        nav.language,
        screen.colorDepth,
        screen.width + "x" + screen.height,
        new Date().getTimezoneOffset(),
        nav.platform,
        !!nav.cookieEnabled,
      ].join("|")

      // Create a simple hash from the fingerprint string
      let hash = 0
      for (let i = 0; i < fingerprint.length; i++) {
        hash = (hash << 5) - hash + fingerprint.charCodeAt(i)
        hash = hash & hash // Convert to 32bit integer
      }

      // Return a positive hex string
      return "visitor-" + Math.abs(hash).toString(16)
    }

    // Check if we already have a visitor ID in localStorage
    if (typeof window !== "undefined") {
      const storedVisitorId = localStorage.getItem("mux_visitor_id")

      if (storedVisitorId) {
        setVisitorId(storedVisitorId)
      } else {
        // Generate new ID and store it
        const newVisitorId = generateBrowserFingerprint()
        localStorage.setItem("mux_visitor_id", newVisitorId)
        setVisitorId(newVisitorId)
      }
    }
  }, [])

  // Handle play button click
  const handlePlayClick = () => {
    // Set a small delay before setting isPlaying to true
    // This gives time for any ongoing operations to complete
    setTimeout(() => {
      setIsPlaying(true)
    }, 50)
  }

  // Handle video end
  const handleVideoEnd = () => {
    setIsPlaying(false)
  }

  return (
    <div className="w-full relative bg-black">
      {/* Main featured content with gradient overlay */}
      <div
        className="relative h-[70vh] sm:h-[85vh] w-full overflow-hidden"
        style={{ isolation: "isolate" }}
      >
        <div
          ref={videoContainerRef}
          className="relative w-full h-full"
          style={{ zIndex: 1 }}
        >
          {isPlaying ? (
            // Use MuxVideoPlayer for video playback
            <div className="relative w-full h-full">
              {/* Language selector for video */}
              <div className="absolute top-4 right-4 z-30">
                <LanguageSelect minimal={true} showVideoText={true} />
              </div>
              <MuxVideoPlayer
                playbackId={muxPlaybackId || t("media.videos.hero_playback_id")}
                thumbnailUrl={thumbnailUrl}
                alt={title}
                className="w-full h-full"
                autoPlay={true}
                onEnded={handleVideoEnd}
                customerId={customer?.id}
                videoTitle={`Trailer_${locale}`}
                locale={locale}
              />
            </div>
          ) : (
            // Thumbnail image with play button overlay
            <>
              <div className="absolute inset-0 w-full h-full">
                <Image
                  src={thumbnailUrl}
                  alt="Featured Content"
                  fill
                  className="object-contain md:object-cover brightness-75"
                  sizes="100vw"
                  priority
                  style={{ objectPosition: "50% 45%" }}
                />
              </div>

              {/* Gradient overlay */}
              <div
                className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-90"
                style={{ zIndex: 10 }}
              ></div>

              {/* Language selector in top right */}
              <div className="absolute top-4 right-4" style={{ zIndex: 30 }}>
                <LanguageSelect minimal={true} showVideoText={true} />
              </div>

              {/* Play button */}
              <div
                className="absolute inset-0 flex items-center justify-center"
                style={{ zIndex: 20 }}
              >
                <CircularPlayButton
                  onClick={handlePlayClick}
                  size={140}
                  className="transition-all duration-300 hover:scale-110"
                  showLanguageSelector={false}
                  isWatchNow={isEpisodePage}
                />
              </div>
            </>
          )}
        </div>

        {/* Content overlay - only visible when video is not playing */}
        {!isPlaying && (
          <div
            className="absolute bottom-0 left-0 p-4 sm:p-6 md:p-12 w-full mt-auto pb-4 sm:pb-6 md:pb-12"
            style={{ zIndex: 30 }}
          >
            <div className="max-w-3xl">
              <h1 className="text-white text-3xl md:text-5xl font-bold mb-4">
                {title}
              </h1>
              <div className="text-gray-300 text-sm md:text-base mb-3">
                {description}
              </div>

              {/* CTA Button */}
              {seasonHandle && (
                <LocalizedClientLink href={`/seasons/${seasonHandle}`}>
                  <Button className="bg-dark-green text-white hover:bg-light-green border-none px-4 sm:px-6 py-1.5 sm:py-2 text-sm sm:text-base font-medium">
                    {ctaText}
                  </Button>
                </LocalizedClientLink>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Hero
