"use client"

import Image from "next/image"
import { Button } from "@medusajs/ui"
import { DigitalProduct } from "types/global"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { Play } from "lucide-react"
import { getDigitalProductPrice } from "@lib/util/get-product-price"

interface FeaturedSoundsProps {
  sounds: DigitalProduct[]
}

const FeaturedSounds = ({ sounds }: FeaturedSoundsProps) => {
  if (!sounds || sounds.length === 0) {
    return null
  }

  return (
    <div className="py-12 px-4 md:px-8 lg:px-12 bg-black">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-white text-2xl md:text-3xl font-bold">
            Featured Sounds
          </h2>
          <LocalizedClientLink href="/sounds">
            <Button
              variant="secondary"
              className="bg-gray-800 hover:bg-gray-700 text-white border-none"
            >
              View All Sounds
            </Button>
          </LocalizedClientLink>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {sounds.map((sound) => (
            <div
              key={sound.id}
              className="bg-gray-900 rounded-lg overflow-hidden transition-transform duration-200 hover:scale-[1.02]"
            >
              <div className="relative aspect-square">
                <Image
                  src="/assets/music-cover.png"
                  alt={sound.name || "Sound thumbnail"}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-200">
                  <div className="bg-white/20 backdrop-blur-sm p-3 rounded-full">
                    <Play className="text-white h-8 w-8" />
                  </div>
                </div>
              </div>
              <div className="p-3">
                <h3 className="text-white text-sm font-medium mb-1 line-clamp-1">
                  {sound.name}
                </h3>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-xs">
                    {getDigitalProductPrice({
                      variant: sound.product_variant,
                    }).cheapestPrice?.calculated_price || "$0.00"}
                  </span>
                  <LocalizedClientLink href={`/sounds/${sound.handle}`}>
                    <Button
                      variant="secondary"
                      className="px-2 py-1 h-auto text-xs bg-gray-800 hover:bg-gray-700 text-white border-none"
                    >
                      Preview
                    </Button>
                  </LocalizedClientLink>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default FeaturedSounds
