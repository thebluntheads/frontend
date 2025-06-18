"use client"

import React, { useState, useEffect } from "react"
import MuxPlayerReact from "@mux/mux-player-react"
import Image from "next/image"
import CircularPlayButton from "@modules/home/components/circular-play-button"

type MuxVideoPlayerProps = {
  playbackId: string
  thumbnailUrl: string
  alt?: string
  className?: string
  autoPlay?: boolean
  muted?: boolean
  loop?: boolean
  jwt?: string
  onEnded?: () => void
  customerId?: string
  videoTitle?: string
  metadata?: {
    video_id: string
    video_title: string
    viewer_user_id: string
  }
}

const MuxVideoPlayer = ({
  playbackId,
  thumbnailUrl,
  alt = "Video thumbnail",
  className = "",
  autoPlay = false,
  muted = false,
  loop = false,
  jwt,
  metadata,
  onEnded,
  customerId,
  videoTitle,
}: MuxVideoPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const [showThumbnail, setShowThumbnail] = useState(true)
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

  // Handle play state changes
  // Reference to the Mux Player
  // Using any type because MuxPlayerReact doesn't export its type
  const playerRef = React.useRef<any>(null)

  const handlePlaying = () => {
    setIsPlaying(true)
    setShowThumbnail(false)
  }

  const handlePause = () => {
    setIsPlaying(false)
  }

  const handleEnded = () => {
    setIsPlaying(false)
    setShowThumbnail(true)
    if (onEnded) onEnded()
  }

  // Handle play button click
  const handlePlayClick = (e: React.MouseEvent) => {
    e.preventDefault()
    setShowThumbnail(false)
    setIsPlaying(true)

    // Start playing the video immediately
    setTimeout(() => {
      if (playerRef.current) {
        playerRef.current.play()
      }
    }, 100)
  }

  return (
    <div
      className={`relative w-full h-full overflow-hidden rounded-lg ${className}`}
    >
      {/* Mux Player */}
      <div
        className={`w-full h-full ${
          showThumbnail ? "opacity-0" : "opacity-100"
        } transition-opacity duration-300`}
      >
        <MuxPlayerReact
          ref={playerRef}
          playbackId={playbackId}
          streamType="on-demand"
          autoPlay={autoPlay}
          muted={muted}
          loop={loop}
          tokens={{ playback: jwt }}
          onPlaying={handlePlaying}
          onPause={handlePause}
          onEnded={handleEnded}
          onLoadedData={() => setIsLoaded(true)}
          style={{
            height: "100%",
            width: "100%",
            aspectRatio: "16/9",
          }}
          theme="custom"
          accent-color="#2D5F2D" // Primary green color
          secondary-color="#1A3C1A" // Darker green for secondary elements
          envKey={process.env.NEXT_PUBLIC_MUX_DATA_ENV_KEY}
          themeProps={{
            loadingIndicator: {
              color: "#2D5F2D", // Match the website's green theme
            },
            controls: {
              backgroundColor: "rgba(0, 0, 0, 0.6)",
            },
          }}
          metadata={
            metadata || {
              video_id: playbackId,
              video_title: videoTitle || alt,
              viewer_user_id: customerId || visitorId || "visitor",
            }
          }
        />
      </div>

      {/* Thumbnail overlay */}
      {showThumbnail && (
        <div className="absolute inset-0 transition-opacity duration-300">
          <Image
            src={thumbnailUrl}
            alt={alt}
            fill
            className="object-contain md:object-cover"
            sizes="100vw"
            priority
          />

          {/* Play button overlay - centered */}
          <div className="absolute inset-0 flex items-center justify-center">
            <CircularPlayButton
              onClick={handlePlayClick}
              size={140}
              className="transition-all duration-300 hover:scale-110"
              isWatchNow={true}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default MuxVideoPlayer
