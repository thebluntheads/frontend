import { useEffect, useState } from "react"
import MuxPlayerReact from "@mux/mux-player-react"
import type { MuxPlayerRefAttributes } from "@mux/mux-player-react"

/**
 * Hook to track playback progress of a Mux player
 * @param playerRef Reference to the Mux player element
 * @returns Current playback time and duration
 */
export const usePlaybackVector = (playerRef: React.RefObject<MuxPlayerRefAttributes>) => {
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)

  useEffect(() => {
    if (!playerRef.current) return

    const player = playerRef.current

    // Function to update time
    const updateTime = () => {
      if (player) {
        setCurrentTime(player.currentTime || 0)
        setDuration(player.duration || 0)
      }
    }

    // Set up event listeners
    const handleTimeUpdate = () => {
      updateTime()
    }

    const handlePlay = () => {
      setIsPlaying(true)
    }

    const handlePause = () => {
      setIsPlaying(false)
    }

    const handleEnded = () => {
      setIsPlaying(false)
    }

    // Add event listeners
    player.addEventListener("timeupdate", handleTimeUpdate)
    player.addEventListener("play", handlePlay)
    player.addEventListener("pause", handlePause)
    player.addEventListener("ended", handleEnded)

    // Initial update
    updateTime()

    // Clean up
    return () => {
      player.removeEventListener("timeupdate", handleTimeUpdate)
      player.removeEventListener("play", handlePlay)
      player.removeEventListener("pause", handlePause)
      player.removeEventListener("ended", handleEnded)
    }
  }, [playerRef.current])

  return {
    currentTime,
    duration,
    isPlaying,
    progress: duration > 0 ? (currentTime / duration) * 100 : 0,
  }
}
