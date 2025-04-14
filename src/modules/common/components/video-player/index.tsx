"use client"

import React, { useState, useRef } from "react"
import Image from "next/image"

type VideoPlayerProps = {
  videoUrl: string
  thumbnailUrl: string
  alt?: string
  className?: string
}

const VideoPlayer = ({
  videoUrl,
  thumbnailUrl,
  alt = "Video thumbnail",
  className = "",
}: VideoPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  const handlePlayClick = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  // Handle video end
  const handleVideoEnd = () => {
    setIsPlaying(false)
    if (videoRef.current) {
      videoRef.current.currentTime = 0
    }
  }

  return (
    <div
      className={`relative w-full h-full overflow-hidden rounded-lg ${className} group`}
    >
      {/* Video element */}
      <video
        ref={videoRef}
        src={videoUrl}
        className={`absolute inset-0 w-full h-full object-cover ${
          isPlaying ? "opacity-100" : "opacity-0"
        }`}
        onEnded={handleVideoEnd}
        playsInline
      />

      {/* Thumbnail image */}
      <div
        className={`absolute inset-0 transition-opacity duration-300 ${
          isPlaying ? "opacity-0" : "opacity-100"
        }`}
      >
        <Image
          src={thumbnailUrl}
          alt={alt}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>

      {/* Play button overlay - always visible on non-playing videos */}
      <div
        className={`absolute inset-0 flex items-center justify-center ${
          isPlaying ? "bg-black/0" : "bg-black/30"
        } 
                   cursor-pointer transition-all duration-300`}
        onClick={handlePlayClick}
      >
        {/* Play button - always visible when not playing, hidden when playing */}
        <div
          className={`w-16 h-16 bg-black/20 backdrop-blur-md rounded-full flex items-center justify-center
                        transition-all duration-300 ${
                          isPlaying
                            ? "opacity-0 scale-90"
                            : "opacity-100 scale-100"
                        }
                        group-hover:scale-110`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="white"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polygon points="5 3 19 12 5 21 5 3"></polygon>
          </svg>
        </div>

        {/* Pause button - only visible when hovering over playing video */}
        {isPlaying && (
          <div
            className="w-16 h-16 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center
                          opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="white"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="6" y="4" width="4" height="16"></rect>
              <rect x="14" y="4" width="4" height="16"></rect>
            </svg>
          </div>
        )}
      </div>
    </div>
  )
}

export default VideoPlayer
