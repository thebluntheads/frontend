"use client"

import React from "react"
import { Play } from "lucide-react"
import LanguageSelect from "@modules/layout/components/language-select"

interface CircularPlayButtonProps {
  onClick: (e: React.MouseEvent) => void
  size?: number
  className?: string
  isWatchNow?: boolean
  showLanguageSelector?: boolean
}

export default function CircularPlayButton({
  onClick,
  size = 120,
  className = "",
  isWatchNow = false,
  showLanguageSelector = true,
}: CircularPlayButtonProps) {
  // Shorter text to prevent crowding and ensure it fits
  const text = isWatchNow
    ? "WATCH NOW • WATCH NOW • "
    : "PRESS TO PLAY • PRESS TO PLAY • "

  const radius = size / 2
  // Adjust text radius to be more conservative for Safari
  const textRadius = radius * 0.75 // More inward positioning
  const center = radius

  return (
    <div className="flex flex-col items-center">
      {/* Language selector above the play button */}
      {showLanguageSelector && (
        <div className="mb-4">
          <LanguageSelect minimal={true} showVideoText={true} />
        </div>
      )}
      
      <div
        className={`relative group cursor-pointer ${className}`}
        style={{ width: size, height: size }}
        onClick={onClick}
      >
      {/* Outer circle with darker background for better text contrast */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-dark-green/40 to-light-green/40 backdrop-blur-md group-hover:from-dark-green/60 group-hover:to-light-green/60 transition-all duration-300" />

      {/* Inner circle with play icon */}
      <div className="absolute inset-4 rounded-full bg-black/70 flex items-center justify-center group-hover:bg-black/80 transition-all duration-300">
        <Play
          className="text-white group-hover:text-light-green transition-colors duration-300"
          size={size / 3}
          fill="currentColor"
        />
      </div>

      {/* Circular text with Safari-specific fixes */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox={`0 0 ${size} ${size}`}
        style={{ overflow: "visible" }}
      >
        <defs>
          <path
            id={`textPath-${size}`}
            d={`M ${center} ${
              center - textRadius
            } A ${textRadius} ${textRadius} 0 1 1 ${center - 0.1} ${
              center - textRadius
            }`}
            fill="none"
          />
        </defs>

        {/* Dark background circle that matches text path exactly */}
        <circle
          cx={center}
          cy={center}
          r={textRadius}
          fill="none"
          stroke="rgba(0,0,0,0.8)"
          strokeWidth="14"
          strokeDasharray={`${2 * Math.PI * textRadius}`}
          strokeDashoffset="0"
          style={{
            transformOrigin: `${center}px ${center}px`,
            strokeLinecap: "round",
            animation: "spin 20s linear infinite",
          }}
        />

        <text
          className="fill-white group-hover:fill-light-green transition-colors duration-300"
          style={{
            fontSize: `${Math.max(8, size * 0.12)}px`, // Responsive font size with minimum
            letterSpacing: "0.5px",
            fontWeight: "600",
            fontFamily: "system-ui, -apple-system, sans-serif", // Better Safari compatibility
            textShadow: "0 1px 2px rgba(0,0,0,0.8)", // Better text visibility
            transformOrigin: `${center}px ${center}px`,
            animation: "spin 20s linear infinite",
          }}
        >
          <textPath
            href={`#textPath-${size}`}
            startOffset="0%"
            style={{
              dominantBaseline: "central", // Better cross-browser text alignment
              textAnchor: "start",
            }}
          >
            {text}
          </textPath>
        </text>
      </svg>
      </div>
    </div>
  )
}
