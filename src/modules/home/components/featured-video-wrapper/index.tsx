"use client"

import React from "react"
import { Text } from "@medusajs/ui"

const FeaturedVideoWrapper = () => {
  const [isPlaying, setIsPlaying] = React.useState(false)
  const videoRef = React.useRef<HTMLVideoElement>(null)
  const videoUrl =
    "https://onconnects-media.s3.us-east-1.amazonaws.com/p/pu/s-5583_1737735753_06dbfce4af3d16db6839.mp4"

  const handlePlayClick = () => {
    if (videoRef.current) {
      videoRef.current.play()
      setIsPlaying(true)
    }
  }

  const handlePauseClick = () => {
    if (videoRef.current) {
      videoRef.current.pause()
      setIsPlaying(false)
    }
  }

  const handleVideoEnd = () => {
    setIsPlaying(false)
    if (videoRef.current) {
      videoRef.current.currentTime = 0
    }
  }

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
              playsInline
              autoPlay
            />

            {/* Pause button overlay */}
            <div
              className="absolute inset-0 flex items-center justify-center bg-black/20 
                        opacity-0 hover:opacity-100 transition-opacity duration-300 cursor-pointer"
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
