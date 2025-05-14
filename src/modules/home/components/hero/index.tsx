"use client"

import { Button } from "@medusajs/ui"
import Image from "next/image"
import { useState, useRef, useEffect } from "react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import CircularPlayButton from "../circular-play-button"

interface HeroProps {
  title?: string
  description?: string
  ctaLink?: string
  ctaText?: string
  thumbnailUrl?: string
  videoUrl?: string
  episodeCount?: number
  seasonHandle?: string
}

const Hero = ({
  title = "Season Title",
  description = "Experience the journey through captivating episodes and exclusive content.",
  ctaLink,
  ctaText = "Watch Season",
  thumbnailUrl = "/assets/preview.png",
  videoUrl = "https://thebluntheads.s3.us-east-2.amazonaws.com/trailer.mp4",
  episodeCount = 0,
  seasonHandle,
}: HeroProps = {}) => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showControls, setShowControls] = useState(false)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [showSpeedOptions, setShowSpeedOptions] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const videoContainerRef = useRef<HTMLDivElement>(null)

  // Handle play button click
  const handlePlayClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsPlaying(true)
    setIsPaused(false)
  }

  // Handle pause button click
  const handlePauseClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (videoRef.current) {
      videoRef.current.pause()
      setIsPaused(true)
    }
  }

  // Handle resume button click
  const handleResumeClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (videoRef.current) {
      videoRef.current.play()
      setIsPaused(false)
    }
  }

  // Toggle fullscreen mode
  const toggleFullscreen = () => {
    if (!videoContainerRef.current) return

    // Detect iOS Safari
    const isIOS =
      /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent)
    const isIOSSafari = isIOS && isSafari

    // Special handling for iOS Safari
    if (isIOSSafari && videoRef.current) {
      // iOS Safari requires using the video element's webkitEnterFullscreen
      try {
        // Use type assertion to access iOS Safari-specific methods
        const videoElement = videoRef.current as HTMLVideoElement & {
          webkitEnterFullscreen?: () => void
          webkitRequestFullscreen?: () => void
        }

        if (videoElement.webkitEnterFullscreen) {
          videoElement.webkitEnterFullscreen()
        } else if (videoElement.webkitRequestFullscreen) {
          videoElement.webkitRequestFullscreen()
        }
        setIsFullscreen(true)
        return
      } catch (err) {
        console.error(`Error handling iOS fullscreen:`, err)
      }
    }

    // Standard approach for other browsers
    const doc = document as any
    const elem = videoContainerRef.current as any

    const isFullscreenNow = !!(
      doc.fullscreenElement ||
      doc.webkitFullscreenElement ||
      doc.mozFullScreenElement ||
      doc.msFullscreenElement ||
      doc.webkitFullScreen ||
      doc.mozFullScreen ||
      doc.msFullScreen
    )

    try {
      if (!isFullscreenNow) {
        // Request fullscreen with vendor prefixes
        const requestFullscreen =
          elem.requestFullscreen ||
          elem.webkitRequestFullscreen ||
          elem.mozRequestFullScreen ||
          elem.msRequestFullscreen

        if (requestFullscreen) {
          requestFullscreen.call(elem)
        }
        setIsFullscreen(true)
      } else {
        // Exit fullscreen with vendor prefixes
        const exitFullscreen =
          doc.exitFullscreen ||
          doc.webkitExitFullscreen ||
          doc.mozCancelFullScreen ||
          doc.msExitFullscreen

        if (exitFullscreen) {
          exitFullscreen.call(document)
        }
        setIsFullscreen(false)
      }
    } catch (err) {
      console.error(`Error handling fullscreen:`, err)
    }
  }

  // Toggle mute state
  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  // Handle volume change
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value)
    setVolume(newVolume)
    if (videoRef.current) {
      videoRef.current.volume = newVolume
      setIsMuted(newVolume === 0)
    }
  }

  // Handle video progress change
  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value)
    setCurrentTime(newTime)
    if (videoRef.current) {
      videoRef.current.currentTime = newTime
    }
  }

  // Change playback speed
  const changePlaybackSpeed = (speed: number) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = speed
      setPlaybackRate(speed)
      setShowSpeedOptions(false)
    }
  }

  // Format time in MM:SS format
  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60)
    const seconds = Math.floor(timeInSeconds % 60)
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`
  }

  // Update time as video plays
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime)
    }
  }

  // Set duration when metadata is loaded
  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration)
    }
  }

  useEffect(() => {
    if (isPlaying && videoRef.current) {
      videoRef.current.play().catch((error) => {
        console.error("Video playback error:", error)
        setIsPlaying(false)
      })
    }
  }, [isPlaying])

  // Handle fullscreen change events with vendor prefixes
  useEffect(() => {
    const doc = document as any

    const handleFullscreenChange = () => {
      const isFullscreenActive = !!(
        doc.fullscreenElement ||
        doc.webkitFullscreenElement ||
        doc.mozFullScreenElement ||
        doc.msFullscreenElement ||
        doc.webkitIsFullScreen ||
        doc.mozFullScreen ||
        doc.msFullscreenElement
      )

      setIsFullscreen(isFullscreenActive)
    }

    // Add all possible fullscreen change events
    document.addEventListener("fullscreenchange", handleFullscreenChange)
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange)
    document.addEventListener("mozfullscreenchange", handleFullscreenChange)
    document.addEventListener("MSFullscreenChange", handleFullscreenChange)

    return () => {
      // Remove all listeners on cleanup
      document.removeEventListener("fullscreenchange", handleFullscreenChange)
      document.removeEventListener(
        "webkitfullscreenchange",
        handleFullscreenChange
      )
      document.removeEventListener(
        "mozfullscreenchange",
        handleFullscreenChange
      )
      document.removeEventListener("MSFullscreenChange", handleFullscreenChange)
    }
  }, [])

  const handleVideoEnd = () => {
    setIsPlaying(false)
    if (videoRef.current) {
      videoRef.current.currentTime = 0
    }
  }

  return (
    <div className="w-full relative bg-black">
      {/* Main featured content with gradient overlay */}
      <div
        className="relative h-[70vh] sm:h-[85vh] w-full overflow-hidden"
        style={{ isolation: "isolate" }}
      >
        {isPlaying ? (
          // Video container - only shown when playing
          <div
            ref={videoContainerRef}
            className="absolute inset-0 w-full h-full flex items-center justify-center"
            style={{ zIndex: 50, backgroundColor: "#000" }}
            onMouseEnter={() => setShowControls(true)}
            onMouseLeave={() => setShowControls(false)}
          >
            <video
              ref={videoRef}
              src={videoUrl}
              className="w-full h-full object-contain"
              onEnded={handleVideoEnd}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              playsInline
              autoPlay
              controls={false}
              style={{ backgroundColor: "#000" }}
            />

            {/* Advanced video controls - bottom bar */}
            <div
              className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity duration-300 ${
                showControls || isPaused ? "opacity-100" : "opacity-0"
              }`}
              style={{ zIndex: 70 }}
            >
              {/* Progress bar */}
              <div className="flex items-center mb-2">
                <span className="text-white text-sm mr-2">
                  {formatTime(currentTime)}
                </span>
                <input
                  type="range"
                  min="0"
                  max={duration || 0}
                  value={currentTime}
                  onChange={handleProgressChange}
                  className="w-full h-1 bg-black/30 rounded-full appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, white ${
                      (currentTime / (duration || 1)) * 100
                    }%, rgba(255,255,255,0.3) 0%)`,
                  }}
                />
                <span className="text-white text-sm ml-2">
                  {formatTime(duration)}
                </span>
              </div>

              {/* Control buttons */}
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-4">
                  {/* Play/Pause button */}
                  <button
                    className="text-white hover:text-white/80 transition-colors"
                    onClick={isPaused ? handleResumeClick : handlePauseClick}
                    aria-label={isPaused ? "Play" : "Pause"}
                  >
                    {isPaused ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <polygon points="5 3 19 12 5 21 5 3"></polygon>
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <rect x="6" y="4" width="4" height="16"></rect>
                        <rect x="14" y="4" width="4" height="16"></rect>
                      </svg>
                    )}
                  </button>

                  {/* Volume control */}
                  <div className="flex items-center">
                    <button
                      className="text-white hover:text-white/80 transition-colors mr-2"
                      onClick={toggleMute}
                      aria-label={isMuted ? "Unmute" : "Mute"}
                    >
                      {isMuted || volume === 0 ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                          <line x1="23" y1="9" x2="17" y2="15"></line>
                          <line x1="17" y1="9" x2="23" y2="15"></line>
                        </svg>
                      ) : volume < 0.5 ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                          <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                        </svg>
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                          <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                          <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
                        </svg>
                      )}
                    </button>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={volume}
                      onChange={handleVolumeChange}
                      className="w-20 h-1 bg-black/30 rounded-full appearance-none cursor-pointer"
                      style={{
                        background: `linear-gradient(to right, white ${
                          volume * 100
                        }%, rgba(255,255,255,0.3) 0%)`,
                      }}
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  {/* Playback speed control */}
                  <div className="relative">
                    <button
                      className="text-white hover:text-white/80 transition-colors flex items-center"
                      onClick={() => setShowSpeedOptions(!showSpeedOptions)}
                      aria-label="Playback speed"
                    >
                      <span className="text-sm mr-1">{playbackRate}x</span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="6 9 12 15 18 9"></polyline>
                      </svg>
                    </button>

                    {showSpeedOptions && (
                      <div className="absolute bottom-full mb-2 right-0 bg-black/90 rounded-md p-2 shadow-lg">
                        {[0.5, 0.75, 1, 1.25, 1.5, 2].map((speed) => (
                          <button
                            key={speed}
                            className={`block w-full text-left px-3 py-1 text-sm ${
                              playbackRate === speed
                                ? "text-light-green"
                                : "text-white"
                            } hover:bg-black/10 rounded`}
                            onClick={() => changePlaybackSpeed(speed)}
                          >
                            {speed}x
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Fullscreen button */}
                  <button
                    className="text-white hover:text-white/80 transition-colors"
                    onClick={toggleFullscreen}
                    aria-label={
                      isFullscreen ? "Exit fullscreen" : "Enter fullscreen"
                    }
                  >
                    {isFullscreen ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"></path>
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path>
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Thumbnail image
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
        )}

        {/* Gradient overlay - only visible when video is not playing */}
        {!isPlaying && (
          <div
            className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-90"
            style={{ zIndex: 10 }}
          ></div>
        )}

        {/* Play button overlay - only visible on thumbnail */}
        {!isPlaying && (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ zIndex: 20 }}
          >
            <CircularPlayButton
              onClick={handlePlayClick}
              size={140}
              className="transition-all duration-300 hover:scale-110"
            />
          </div>
        )}

        {/* Content overlay - only visible when video is not playing */}
        {!isPlaying && (
          <div
            className="absolute bottom-0 left-0 p-6 sm:p-8 md:p-12 w-full mt-auto"
            style={{ zIndex: 30, bottom: 0 }}
          >
            <div className="max-w-3xl">
              <h1 className="text-white text-3xl md:text-5xl font-bold mb-4">
                {title}
              </h1>
              {episodeCount > 0 && (
                <div className="text-gray-300 text-sm md:text-base mb-3">
                  {episodeCount} Episode{episodeCount !== 1 ? "s" : ""}
                </div>
              )}
              <p className="text-white/90 text-xl mb-6 line-clamp-2">
                {description}
              </p>

              {/* CTA Button */}
              {seasonHandle && (
                <LocalizedClientLink href={`/seasons/${seasonHandle}`}>
                  <Button className="bg-dark-green text-white hover:hover:bg-light-green border-none px-6 py-2 text-base font-medium">
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
