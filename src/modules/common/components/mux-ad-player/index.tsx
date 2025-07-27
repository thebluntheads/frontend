"use client"

import { useState, useRef, useEffect } from "react"
import MuxPlayerReact, {
  type MuxPlayerRefAttributes,
} from "@mux/mux-player-react"
import Image from "next/image"
import { useTranslations } from "next-intl"
import { Button } from "@medusajs/ui"
import { usePlaybackVector } from "../../hooks/use-playback-vector"
import { updateMuxAssetMetadata } from "../../utils/mux-analytics"
import CircularPlayButton from "@modules/home/components/circular-play-button"

type MuxAdPlayerProps = {
  playbackId: string
  thumbnailUrl: string
  alt?: string
  className?: string
  onAdEnded: () => void
  onAdSkipped: (timeWatched: number) => void
  customerId?: string
  videoTitle?: string
  locale?: string
  skipAfterSeconds?: number
  allowSkip?: boolean
  metadata?: Record<string, any> | null
}

const MuxAdPlayer = ({
  playbackId,
  thumbnailUrl,
  alt = "Advertisement",
  className = "",
  onAdEnded,
  onAdSkipped,
  customerId,
  videoTitle,
  locale,
  skipAfterSeconds = 10,
  allowSkip = false,
  metadata = {},
}: MuxAdPlayerProps) => {
  const t = useTranslations()
  const playerRef = useRef<MuxPlayerRefAttributes>(null)
  const [showThumbnail, setShowThumbnail] = useState(true)
  const { currentTime, isPlaying } = usePlaybackVector(playerRef)
  const [duration, setDuration] = useState(0)

  // Track ad status and watch time for analytics
  const [adStatus, setAdStatus] = useState<string | null>(null)
  const [adWatchTime, setAdWatchTime] = useState<string | null>(null)

  // Handle play button click
  const handlePlay = () => {
    setShowThumbnail(false)
    if (playerRef.current) {
      playerRef.current.play()
    }
  }

  // Get video duration when metadata is loaded
  useEffect(() => {
    const handleDurationChange = () => {
      if (playerRef.current) {
        setDuration(playerRef.current.duration || 0)
      }
    }

    // Try to get duration immediately if already available
    if (playerRef.current && playerRef.current.duration) {
      setDuration(playerRef.current.duration)
    }

    // Add event listener for duration change
    const player = playerRef.current
    if (player) {
      player.addEventListener("durationchange", handleDurationChange)
    }

    return () => {
      if (player) {
        player.removeEventListener("durationchange", handleDurationChange)
      }
    }
  }, [playerRef.current])

  // Handle ad ended
  const handleEnded = () => {
    setAdStatus("completed")

    // Use ad_mux_id from metadata if available, otherwise use playbackId
    const adAssetId = metadata?.ad_mux_id || playbackId

    // if (adAssetId) {
    //   updateMuxAssetMetadata(adAssetId, {
    //     custom_1: "completed",
    //   }).catch((error) => {
    //     console.error("Failed to update ad completion metadata:", error)
    //   })
    // }
    onAdEnded()
  }

  // Handle skip button click
  const handleSkip = () => {
    if (playerRef.current) {
      const skipTime = currentTime
      const roundedSkipTime = String(Math.round(skipTime))
      setAdStatus("skipped")
      setAdWatchTime(roundedSkipTime)

      // Use ad_mux_id from metadata if available, otherwise use playbackId
      const adAssetId = metadata?.ad_mux_id || playbackId

      // if (adAssetId) {
      //   updateMuxAssetMetadata(adAssetId, {
      //     custom_1: "skipped",
      //     custom_2: roundedSkipTime
      //   }).catch(error => {
      //     console.error("Failed to update ad skip metadata:", error)
      //   })
      // }

      playerRef.current.pause()
      onAdSkipped(skipTime)
    }
  }

  // Show skip button only after skipAfterSeconds of actual playback
  const showSkipButton = isPlaying && currentTime >= skipAfterSeconds

  // Generate metadata for Mux player
  const playerMetadata = {
    video_id: playbackId,
    video_title: `Ad_${videoTitle}`,
    viewer_user_id: customerId,
    ...(adStatus && { custom_1: adStatus }),
    ...(adWatchTime && { custom_2: adWatchTime }),
    ...(locale && { video_language_code: locale }),
    ...(metadata?.ad_mux_id && { ad_mux_id: metadata.ad_mux_id }),
  }

  return (
    <div className={`relative w-full h-full ${className}`}>
      {/* Mux Player */}
      <div
        className={`w-full h-full ${
          showThumbnail ? "opacity-0" : "opacity-100"
        } transition-opacity duration-300`}
      >
        <MuxPlayerReact
          ref={playerRef}
          playbackId={playbackId}
          metadata={playerMetadata}
          autoPlay={!showThumbnail}
          muted={false}
          envKey={process.env.NEXT_PUBLIC_MUX_DATA_ENV_KEY}
          streamType="on-demand"
          style={{ height: "100%", width: "100%" }}
          onEnded={handleEnded}
          onPlaying={() => setShowThumbnail(false)}
          theme="custom"
          accentColor="#2D5F2D" // Primary green color
          secondaryColor="#1A3C1A" // Darker green for secondary elements
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
            style={{ objectFit: "cover" }}
            priority
          />
          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
            <CircularPlayButton onClick={handlePlay} />
          </div>
        </div>
      )}

      {/* Skip button - only show after skipAfterSeconds of playback if allowSkip is true */}
      {!showThumbnail && currentTime >= skipAfterSeconds && allowSkip && (
        <div className="absolute bottom-16 right-4 z-30">
          <Button
            variant="secondary"
            onClick={handleSkip}
            className="bg-white hover:bg-gray-100 text-black font-medium"
          >
            {t("common.skip_ad")}
          </Button>
        </div>
      )}

      {/* Ad Label with countdown to end of video */}
      {!showThumbnail && (
        <div className="absolute top-16 right-4 z-30 bg-black/70 px-3 py-1.5 rounded text-white text-sm font-medium">
          {t("common.ad")} • {Math.max(0, Math.ceil(duration - currentTime))}s
        </div>
      )}
    </div>
  )
}

export default MuxAdPlayer
