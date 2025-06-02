"use client"

import React, { useState, useRef, useEffect } from "react"

interface AudioPlayerProps {
  src: string
  isPlaying: boolean
  onEnded: () => void
  onProgress?: (progress: number) => void
}

export default function AudioPlayer({
  src,
  isPlaying,
  onEnded,
  onProgress,
}: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const audioElementRef = useRef<HTMLAudioElement | null>(null)

  // Create audio element only once
  useEffect(() => {
    if (!audioElementRef.current) {
      audioElementRef.current = new Audio()
      audioRef.current = audioElementRef.current
    }

    return () => {
      if (audioElementRef.current) {
        audioElementRef.current.pause()
        audioElementRef.current.src = ""
      }
    }
  }, [])

  // Update progress
  useEffect(() => {
    if (!audioRef.current) return

    const updateProgress = () => {
      if (audioRef.current) {
        const current = audioRef.current.currentTime
        const total = audioRef.current.duration || 0
        setCurrentTime(current)
        setDuration(total)

        // Calculate progress percentage (0-1)
        const progressPercent = total > 0 ? current / total : 0

        // Call the progress callback if provided
        if (onProgress) {
          onProgress(progressPercent)
        }
      }
    }

    // Set up time update listener
    audioRef.current.addEventListener("timeupdate", updateProgress)
    audioRef.current.addEventListener("ended", onEnded)
    audioRef.current.addEventListener("canplaythrough", () => {
      setIsLoaded(true)
    })
    audioRef.current.addEventListener("loadedmetadata", () => {
      setDuration(audioRef.current?.duration || 0)
    })
    audioRef.current.addEventListener("error", (e) => {
      console.error("Audio error:", e)
    })

    return () => {
      if (audioRef.current) {
        audioRef.current.removeEventListener("timeupdate", updateProgress)
        audioRef.current.removeEventListener("ended", onEnded)
        audioRef.current.removeEventListener("canplaythrough", () =>
          setIsLoaded(true)
        )
        audioRef.current.removeEventListener("loadedmetadata", () => {
          setDuration(audioRef.current?.duration || 0)
        })
        audioRef.current.removeEventListener("error", (e) => {
          console.error("Audio error:", e)
        })
      }
    }
  }, [onProgress, onEnded])

  // Handle source changes with proper promise handling
  useEffect(() => {
    if (!audioRef.current || !src) return

    // Only update if the source has changed
    if (audioRef.current.src !== src) {
      // First pause any current playback to avoid conflicts
      if (!audioRef.current.paused) {
        audioRef.current.pause()
      }

      // Then update the source
      audioRef.current.src = src
      audioRef.current.load()
      setIsLoaded(false)
      setCurrentTime(0)

      // We'll let the play/pause effect handle starting playback
      // This avoids race conditions between source changes and play/pause operations
    }
  }, [src])

  // Handle play/pause with proper promise handling
  useEffect(() => {
    if (!audioRef.current || !isLoaded) return

    let playPromise: Promise<void> | undefined

    const handlePlayback = async () => {
      try {
        if (isPlaying) {
          // Store the play promise to handle it properly
          if (audioRef.current) {
            // Only attempt to play if it's not already playing
            if (audioRef.current.paused) {
              playPromise = audioRef.current.play()
              // Wait for the play promise to resolve before doing anything else
              if (playPromise !== undefined) {
                await playPromise
              }
            }
          }
        } else {
          // Only pause if we're not in the middle of a play operation
          if (audioRef.current && !audioRef.current.paused) {
            audioRef.current.pause()
          }
        }
      } catch (error) {
        console.error("Playback operation error:", error)
      }
    }

    handlePlayback()

    // Cleanup function to handle component unmount during playback
    return () => {
      if (playPromise) {
        playPromise.catch(() => {})
      }
    }
  }, [isPlaying, isLoaded])

  // No visible UI - this is just the audio functionality
  return null
}
