"use client"

import React from "react"
import { useTranslations } from "next-intl"
import { Play } from "lucide-react"

interface CircularPlayButtonProps {
  onClick: (e: React.MouseEvent) => void
  size?: number
  className?: string
}

export default function CircularPlayButton({
  onClick,
  size = 120,
  className = "",
}: CircularPlayButtonProps) {
  const text = "Press to play" // This could be translated: t('Hero.pressToPlay')

  // Calculate dimensions
  const radius = size / 2
  const textRadius = radius - 10 // Slightly smaller than the circle radius

  return (
    <div
      className={`relative group cursor-pointer ${className}`}
      style={{ width: size, height: size }}
      onClick={onClick}
    >
      {/* Outer circle with gradient border */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-dark-green/30 to-light-green/30 backdrop-blur-sm group-hover:from-dark-green/50 group-hover:to-light-green/50 transition-all duration-300"></div>

      {/* Inner circle with play button */}
      <div className="absolute inset-2 rounded-full bg-black/70 flex items-center justify-center group-hover:bg-black/80 transition-all duration-300">
        <Play
          className="text-white group-hover:text-light-green transition-colors duration-300"
          size={size / 3}
          fill="currentColor"
        />
      </div>

      {/* SVG for circular text */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox={`0 0 ${size} ${size}`}
      >
        <path
          id="textPath"
          fill="none"
          d={`M ${size / 2}, ${
            size / 2
          } m 0, -${textRadius} a ${textRadius},${textRadius} 0 1,1 -0.1,0 z`}
        />
        <text
          className="text-[15px] fill-white/70 group-hover:fill-light-green"
          letterSpacing="-0.5"
        >
          <textPath href="#textPath" startOffset="0%">
            {text} • {text} • {text} • {text} •
          </textPath>
        </text>
      </svg>
    </div>
  )
}
