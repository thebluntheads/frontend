"use client"

import React, { useRef, useState, useEffect } from "react"
import ReactPlayer from "react-player"
import { Text } from "@medusajs/ui"

const FeaturedVideoWrapper = () => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [controlsVisible, setControlsVisible] = useState(false)

  const playerRef = useRef<ReactPlayer>(null)
  const controlsTimerRef = useRef<NodeJS.Timeout | null>(null)

  const videoUrl =
    "https://onconnects-media.s3.us-east-1.amazonaws.com/p/pu/s-5583_1737735753_06dbfce4af3d16db6839.mp4"
  const thumbnailUrl =
    "https://onconnects-media.s3.us-east-1.amazonaws.com/video-thumbnail.jpg"
  const CONTROLS_TIMEOUT = 2000

  const hideControlsWithDelay = () => {
    if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current)
    setControlsVisible(true)
    controlsTimerRef.current = setTimeout(() => {
      setControlsVisible(false)
    }, CONTROLS_TIMEOUT)
  }

  const handlePlayClick = () => {
    setIsPlaying(true)
    hideControlsWithDelay()
  }

  const handlePause = () => {
    setIsPlaying(false)
    setControlsVisible(true)
    if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current)
  }

  const handlePlayerClick = () => {
    if (isPlaying) hideControlsWithDelay()
  }

  useEffect(() => {
    return () => {
      if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current)
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

      <div className="relative aspect-video rounded-xl overflow-hidden max-w-4xl mx-auto shadow-2xl bg-black">
        {isPlaying ? (
          <div
            className="absolute inset-0 w-full h-full"
            onClick={handlePlayerClick}
            onTouchStart={handlePlayerClick}
          >
            <ReactPlayer
              ref={playerRef}
              url={videoUrl}
              playing={isPlaying}
              controls={false}
              width="100%"
              height="100%"
              onEnded={handlePause}
              playsinline
            />

            {controlsVisible && (
              <div
                className="absolute inset-0 flex items-center justify-center bg-black/20 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation()
                  handlePause()
                }}
                onTouchStart={(e) => {
                  e.stopPropagation()
                  handlePause()
                }}
                style={{ WebkitTapHighlightColor: "transparent" }}
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
          <div className="absolute inset-0 w-full h-full">
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: `url('${thumbnailUrl}')`,
                backgroundSize: "cover",
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

            <div
              className="absolute inset-0 flex items-center justify-center cursor-pointer"
              onClick={handlePlayClick}
              style={{ WebkitTapHighlightColor: "transparent" }}
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
                  <polygon points="5 3 19 12 5 21 5 3" />
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
