"use client"

import React, { useEffect, useRef, useState } from "react"
import { Text } from "@medusajs/ui"

const FeaturedVideoWrapper = () => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [showControls, setShowControls] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const controlsTimerRef = useRef<NodeJS.Timeout | null>(null)
  const controlsRef = useRef<HTMLDivElement>(null)
  const videoUrl =
    "https://onconnects-media.s3.us-east-1.amazonaws.com/p/pu/s-5583_1737735753_06dbfce4af3d16db6839.mp4"

  // Function to show controls and set timer to hide them
  const showControlsTemporarily = () => {
    setShowControls(true)
    
    // Clear any existing timer
    if (controlsTimerRef.current) {
      clearTimeout(controlsTimerRef.current)
    }
    
    // Set new timer to hide controls after 2 seconds
    controlsTimerRef.current = setTimeout(() => {
      setShowControls(false)
    }, 2000)
  }
  
  // Force hide controls - useful for Safari
  const forceHideControls = () => {
    if (controlsTimerRef.current) {
      clearTimeout(controlsTimerRef.current)
    }
    setShowControls(false)
    
    // Direct DOM manipulation for Safari on iOS
    if (controlsRef.current) {
      controlsRef.current.style.opacity = '0'
      controlsRef.current.style.visibility = 'hidden'
      controlsRef.current.style.pointerEvents = 'none'
    }
  }

  // Handle play button click
  const handlePlayClick = () => {
    if (videoRef.current) {
      videoRef.current.play()
      setIsPlaying(true)
      showControlsTemporarily()
    }
  }

  // Handle pause button click
  const handlePauseClick = () => {
    if (videoRef.current) {
      videoRef.current.pause()
      setIsPlaying(false)
      setShowControls(true) // Keep controls visible when paused
    }
  }

  // Handle video end
  const handleVideoEnd = () => {
    setIsPlaying(false)
    if (videoRef.current) {
      videoRef.current.currentTime = 0
    }
  }
  
  // Show controls when video is interacted with
  const handleVideoInteraction = () => {
    if (isPlaying) {
      showControlsTemporarily()
      
      // For Safari on iOS, ensure controls are hidden after delay
      setTimeout(forceHideControls, 2500)
    }
  }
  
  // Setup event listeners and cleanup
  useEffect(() => {
    // iOS Safari specific - hide controls when video is playing
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isPlaying) {
        forceHideControls()
      }
    }
    
    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    // Auto-hide controls after 2 seconds when component mounts
    const initialHideTimer = setTimeout(forceHideControls, 2000)
    
    return () => {
      if (controlsTimerRef.current) {
        clearTimeout(controlsTimerRef.current)
      }
      clearTimeout(initialHideTimer)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [isPlaying])

  return (
    <div className="py-8 px-8 md:px-12">
      <div className="mb-6">
        <Text className="text-xl font-medium text-white">Featured Video</Text>
        <Text className="text-sm text-white/60 mt-1">
          Click to play preview
        </Text>
      </div>

      <div className="relative aspect-video rounded-xl overflow-hidden max-w-4xl mx-auto shadow-2xl bg-gray-900">
        {isPlaying ? (
          // Video container - only shown when playing
          <div className="absolute inset-0 w-full h-full">
            <video
              ref={videoRef}
              src={videoUrl}
              className="w-full h-full object-contain"
              onEnded={handleVideoEnd}
              onClick={handleVideoInteraction}
              onTouchStart={handleVideoInteraction}
              onPlay={() => {
                showControlsTemporarily()
                // Force hide controls after video starts playing (helps with Safari)
                setTimeout(forceHideControls, 2500)
              }}
              playsInline
              autoPlay
            />

            {/* Pause button overlay */}
            <div
              ref={controlsRef}
              className={`absolute inset-0 flex items-center justify-center bg-black/20 
                        transition-opacity duration-300 cursor-pointer
                        ${showControls ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
              style={{ 
                pointerEvents: showControls ? 'auto' : 'none',
                WebkitTapHighlightColor: 'transparent' // Prevent tap highlight on iOS
              }}
              onClick={handlePauseClick}
            >
              <div
                className="w-28 h-28 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center
                            border border-white/30 shadow-lg"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="white"
                  stroke="white"
                  strokeWidth="1"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="6" y="4" width="4" height="16"></rect>
                  <rect x="14" y="4" width="4" height="16"></rect>
                </svg>
              </div>
            </div>
          </div>
        ) : (
          // Thumbnail container with play button
          <div className="absolute inset-0 w-full h-full">
            {/* Thumbnail image */}
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage:
                  "url('https://onconnects-media.s3.us-east-1.amazonaws.com/video-thumbnail.jpg')",
                backgroundSize: "cover",
              }}
            ></div>

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>

            {/* Play button */}
            <div
              className="absolute inset-0 flex items-center justify-center cursor-pointer"
              onClick={handlePlayClick}
            >
              <div
                className="w-28 h-28 bg-black/20 backdrop-blur-md rounded-full flex items-center justify-center
                            transition-all duration-300 hover:scale-110 hover:bg-black/30 border border-white/30 shadow-lg"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="white"
                  stroke="white"
                  strokeWidth="1"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polygon points="5 3 19 12 5 21 5 3"></polygon>
                </svg>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default FeaturedVideoWrapper
