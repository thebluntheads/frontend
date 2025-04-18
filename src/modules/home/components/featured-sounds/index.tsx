"use client"

import Image from "next/image"
import { Button } from "@medusajs/ui"
import { DigitalProduct } from "types/global"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { Play, Pause, Volume2, VolumeX } from "lucide-react"
import { getDigitalProductPrice } from "@lib/util/get-product-price"
import { useState, useRef, useEffect } from "react"

interface FeaturedSoundsProps {
  sounds: DigitalProduct[]
}

const FeaturedSounds = ({ sounds }: FeaturedSoundsProps) => {
  const [currentPlaying, setCurrentPlaying] = useState<string | null>(null)
  const [isMuted, setIsMuted] = useState(false)
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement | null }>({})
  const [playProgress, setPlayProgress] = useState<{ [key: string]: number }>(
    {}
  )

  // Handle play/pause toggle
  const togglePlay = (soundId: string, previewUrl?: string) => {
    if (!previewUrl) return

    const audio = audioRefs.current[soundId]
    if (!audio) return

    if (currentPlaying === soundId) {
      // Pause current track
      audio.pause()
      setCurrentPlaying(null)
    } else {
      // Pause any currently playing audio
      if (currentPlaying && audioRefs.current[currentPlaying]) {
        audioRefs.current[currentPlaying]?.pause()
      }

      // Play the new track
      audio.play()
      setCurrentPlaying(soundId)
    }
  }

  // Handle mute toggle
  const toggleMute = () => {
    setIsMuted(!isMuted)

    // Apply mute state to all audio elements
    Object.values(audioRefs.current).forEach((audio) => {
      if (audio) audio.muted = !isMuted
    })
  }

  // Update progress for the playing track
  const updateProgress = (soundId: string) => {
    const audio = audioRefs.current[soundId]
    if (!audio) return

    const progress = (audio.currentTime / audio.duration) * 100
    setPlayProgress((prev) => ({ ...prev, [soundId]: progress }))

    // Auto-stop after 30 seconds for preview
    if (audio.currentTime >= 30) {
      audio.pause()
      audio.currentTime = 0
      setCurrentPlaying(null)
      setPlayProgress((prev) => ({ ...prev, [soundId]: 0 }))
    }
  }

  // Handle audio ended event
  const handleEnded = (soundId: string) => {
    setCurrentPlaying(null)
    setPlayProgress((prev) => ({ ...prev, [soundId]: 0 }))
  }

  if (!sounds || sounds.length === 0) {
    return null
  }

  return (
    <div className="py-12 px-4 md:px-8 lg:px-12 bg-black/60 backdrop-blur-md rounded-xl border border-white/5 my-8 w-full">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center">
            <h2 className="text-white text-2xl md:text-3xl font-bold">
              Featured Sounds
            </h2>
            <button
              onClick={toggleMute}
              className="p-2 rounded-full bg-dark-green/20 hover:bg-dark-green/30 transition-colors"
            >
              {isMuted ? (
                <VolumeX className="text-white h-4 w-4" />
              ) : (
                <Volume2 className="text-white h-4 w-4" />
              )}
            </button>
          </div>
          <LocalizedClientLink href="/sounds">
            <Button
              variant="secondary"
              className="bg-dark-green hover:bg-light-green text-white border-none"
            >
              View All Sounds
            </Button>
          </LocalizedClientLink>
        </div>

        <div className="space-y-4">
          {sounds.slice(0, 5).map((sound) => {
            const previewUrl = sound.preview_url
            const isPlaying = currentPlaying === sound.id
            const progress = playProgress[sound.id] || 0

            return (
              <div
                key={sound.id}
                className="bg-black/40 backdrop-blur-sm rounded-xl overflow-hidden transition-all duration-200 hover:bg-black/60 border border-white/10 group"
              >
                <div className="flex items-center p-4">
                  {/* Album art */}
                  <div className="relative h-16 w-16 rounded-lg overflow-hidden mr-4 flex-shrink-0">
                    <Image
                      src={"/assets/music-cover.png"}
                      alt={sound.name || "Sound thumbnail"}
                      fill
                      className="object-cover"
                    />
                    <button
                      onClick={() => togglePlay(sound.id, previewUrl)}
                      className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                      disabled={!previewUrl}
                    >
                      <div className="bg-dark-green/80 backdrop-blur-sm p-2 rounded-full">
                        {isPlaying ? (
                          <Pause className="text-white h-6 w-6" />
                        ) : (
                          <Play className="text-white h-6 w-6" />
                        )}
                      </div>
                    </button>
                  </div>

                  {/* Track info */}
                  <div className="flex-grow">
                    <h3 className="text-white text-base font-medium mb-1">
                      {sound.name}
                    </h3>
                    <div className="flex items-center w-full">
                      <div className="flex-grow mr-3">
                        {/* Progress bar */}
                        <div className="h-1.5 bg-white/10 rounded-full w-full overflow-hidden">
                          <div
                            className="h-full bg-dark-green rounded-full transition-all duration-100"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                      <span className="text-white/60 text-xs whitespace-nowrap">
                        {previewUrl ? "30s preview" : "No preview"}
                      </span>
                    </div>
                  </div>

                  {/* Audio element (hidden) */}
                  {previewUrl && (
                    <audio
                      ref={(el) => {
                        audioRefs.current[sound.id] = el
                        return undefined
                      }}
                      src={previewUrl}
                      onTimeUpdate={() => updateProgress(sound.id)}
                      onEnded={() => handleEnded(sound.id)}
                      muted={isMuted}
                      preload="metadata"
                    />
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default FeaturedSounds
