"use client"

import React from "react"
import { cn } from "../../lib/utils"

interface AudioWaveProps {
  isPlaying?: boolean
  className?: string
}

// Keeping this component for backwards compatibility, but not using the wave animation
export function AudioWave({ isPlaying = false, className }: AudioWaveProps) {
  return null
}

export function PlayButton({
  isPlaying = false,
  onClick,
  className,
}: {
  isPlaying?: boolean
  onClick?: () => void
  className?: string
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center justify-center w-8 h-8 rounded-full bg-dark-green hover:bg-dark-green text-white transition-colors",
        className
      )}
    >
      {isPlaying ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="currentColor"
          stroke="none"
        >
          <rect x="6" y="4" width="4" height="16"></rect>
          <rect x="14" y="4" width="4" height="16"></rect>
        </svg>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="currentColor"
          stroke="none"
        >
          <polygon points="5 3 19 12 5 21 5 3"></polygon>
        </svg>
      )}
    </button>
  )
}
