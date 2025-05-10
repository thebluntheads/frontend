"use client"

import React, { useEffect, useRef, useState } from "react"
import { Text } from "@medusajs/ui"

const FeaturedVideoWrapper = () => {
  // State
  const [isPlaying, setIsPlaying] = useState(false)
  const [controlsVisible, setControlsVisible] = useState(false)
  
  // Refs
  const videoRef = useRef<HTMLVideoElement>(null)
  const controlsTimerRef = useRef<number | null>(null)
  const videoContainerRef = useRef<HTMLDivElement>(null)
  
  // Constants
  const videoUrl = "https://onconnects-media.s3.us-east-1.amazonaws.com/p/pu/s-5583_1737735753_06dbfce4af3d16db6839.mp4"
  const CONTROLS_TIMEOUT = 2000 // 2 seconds
  
  // Hide controls after delay
  const hideControlsWithDelay = () => {
    // Clear any existing timer
    if (controlsTimerRef.current) {
      window.clearTimeout(controlsTimerRef.current)
    }
    
    // Set controls to visible immediately
    setControlsVisible(true)
    
    // Hide controls after delay
    controlsTimerRef.current = window.setTimeout(() => {
      setControlsVisible(false)
    }, CONTROLS_TIMEOUT)
  }
  
  // Handle video play
  const handlePlay = () => {
    if (videoRef.current) {
      try {
        const playPromise = videoRef.current.play()
        
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              setIsPlaying(true)
              hideControlsWithDelay()
            })
            .catch(error => {
              console.error("Play error:", error)
              setIsPlaying(false)
            })
        }
      } catch (error) {
        console.error("Error playing video:", error)
      }
    }
  }
  
  // Handle video pause
  const handlePause = () => {
    if (videoRef.current) {
      videoRef.current.pause()
      setIsPlaying(false)
      setControlsVisible(true) // Keep controls visible when paused
      
      // Clear any hide timer
      if (controlsTimerRef.current) {
        window.clearTimeout(controlsTimerRef.current)
      }
    }
  }
  
  // Handle video end
  const handleVideoEnd = () => {
    setIsPlaying(false)
    setControlsVisible(false)
    if (videoRef.current) {
      videoRef.current.currentTime = 0
    }
  }
  
  // Handle video container click
  const handleVideoContainerClick = () => {
    if (isPlaying) {
      hideControlsWithDelay()
    }
  }

  // Setup and cleanup effects
  useEffect(() => {
    // Cleanup function
    return () => {
      if (controlsTimerRef.current) {
        window.clearTimeout(controlsTimerRef.current)
      }
    }
  }, [])

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
          // Video playing state
          <div 
            ref={videoContainerRef}
            className="absolute inset-0 w-full h-full" 
            onClick={handleVideoContainerClick}
          >
            {/* Video element */}
            <video
              ref={videoRef}
              src={videoUrl}
              className="w-full h-full object-contain"
              onEnded={handleVideoEnd}
              playsInline
              autoPlay
              muted={false}
              controls={false}
            />

            {/* Custom controls overlay - absolutely positioned */}
            {controlsVisible && (
              <div 
                className="absolute inset-0 flex items-center justify-center bg-black/20 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation() // Prevent triggering container click
                  handlePause()
                }}
                style={{ WebkitTapHighlightColor: 'transparent' }}
              >
                <div className="w-28 h-28 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30 shadow-lg">
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
            )}
          </div>
        ) : (
          // Thumbnail with play button state
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
              onClick={handlePlay}
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              <div className="w-28 h-28 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30 shadow-lg hover:bg-black/60 transition-colors">
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
