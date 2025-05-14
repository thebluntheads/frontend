"use client"

import React from "react"
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
  const text = "Press to play • Press to play •"
  const radius = size / 2
  const textRadius = radius - 10

  return (
    <div
      className={`relative group cursor-pointer ${className}`}
      style={{ width: size, height: size }}
      onClick={onClick}
    >
      {/* Outer circle */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-dark-green/30 to-light-green/30 backdrop-blur-sm group-hover:from-dark-green/50 group-hover:to-light-green/50 transition-all duration-300" />

      {/* Inner circle with play icon */}
      <div className="absolute inset-4 rounded-full bg-black/70 flex items-center justify-center group-hover:bg-black/80 transition-all duration-300">
        <Play
          className="text-white group-hover:text-light-green transition-colors duration-300"
          size={size / 3}
          fill="currentColor"
        />
      </div>

      {/* Circular text */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox={`0 0 ${size} ${size}`}
      >
        <defs>
          <path
            id="textPath"
            d={`M ${radius}, ${radius} m 0, -${textRadius} a ${textRadius},${textRadius} 0 1,1 -0.1,0 z`}
            fill="none"
          />
        </defs>
        <text
          className="fill-white/70 group-hover:fill-light-green"
          style={{
            fontSize: size * 0.2,
            letterSpacing: "0.5px",
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
