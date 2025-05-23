"use client"

import React from "react"
import { Play } from "lucide-react"

interface CircularPlayButtonProps {
  onClick: (e: React.MouseEvent) => void
  size?: number
  className?: string
  isWatchNow?: boolean
}

export default function CircularPlayButton({
  onClick,
  size = 120,
  className = "",
  isWatchNow = false,
}: CircularPlayButtonProps) {
  // Add more spacing between words and use fewer characters to prevent truncation
  const text = isWatchNow
    ? "WATCH NOW • • WATCH NOW • •"
    : "PRESS TO PLAY • PRESS TO PLAY•"
  const radius = size / 2
  const textRadius = radius - 10

  return (
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

      {/* Circular text with background for better readability */}
      <svg
        className="absolute inset-0 w-full h-full animate-spin-slow"
        viewBox={`0 0 ${size} ${size}`}
      >
        <defs>
          <path
            id="textPath"
            d={`M ${radius}, ${radius} m 0, -${textRadius} a ${textRadius},${textRadius} 0 1,1 -0.1,0 z`}
            fill="none"
          />
        </defs>
        {/* Add a subtle background path for the text */}
        <path
          id="textBg"
          d={`M ${radius}, ${radius} m 0, -${textRadius} a ${textRadius},${textRadius} 0 1,1 -0.1,0 z`}
          fill="none"
          stroke="rgba(0,0,0,0.5)"
          strokeWidth="12"
          strokeLinecap="round"
        />

        <text
          className="fill-white group-hover:fill-light-green"
          style={{
            fontSize: size * 0.15, // Slightly smaller font size
            letterSpacing: "1px", // More letter spacing
            fontWeight: "bold", // Make text bold
          }}
          textAnchor="middle"
          dominantBaseline="middle"
        >
          <textPath href="#textPath" startOffset="50%" dy="1.5">
            {text}
          </textPath>
        </text>
      </svg>
    </div>
  )
}
