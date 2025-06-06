"use client"

import React, { useEffect, useState } from "react"
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
  onEnded,
}: MuxVideoPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const [showThumbnail, setShowThumbnail] = useState(true)

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
          themeProps={{
            loadingIndicator: {
              color: "#2D5F2D", // Match the website's green theme
            },
            controls: {
              backgroundColor: "rgba(0, 0, 0, 0.6)",
            },
          }}
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
