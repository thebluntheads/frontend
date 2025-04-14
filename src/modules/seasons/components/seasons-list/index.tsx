"use client"

import { HttpTypes } from "@medusajs/types"
import { motion } from "framer-motion"
import Image from "next/image"
import { useState, useEffect } from "react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { DigitalProduct } from "types/global"
import { listSeasonsEpisodes } from "@lib/data/digital-products"

interface SeasonsListProps {
  seasons: DigitalProduct[]
  region: HttpTypes.StoreRegion
}

interface SeasonMetadata {
  season_number?: string
  thumbnail_url?: string
  description?: string
  episode_count?: string
  type?: string
}

const SeasonsList = ({ seasons }: SeasonsListProps) => {
  if (!seasons.length) {
    return (
      <div className="py-12">
        <div className="text-center text-white/70">
          <h2 className="text-2xl font-semibold mb-4">No seasons found</h2>
          <p>Check back later for new content.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
      {seasons.map((season) => (
        <SeasonCard key={season.id} season={season} />
      ))}
    </div>
  )
}

const SeasonCard = ({ season }: { season: DigitalProduct }) => {
  // State to store episode count
  const [episodeCount, setEpisodeCount] = useState<number>(0)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  // Extract season number from metadata or title
  const seasonNumber = season.name.match(/Season (\d+)/)
    ? season.name.match(/Season (\d+)/)?.[1]
    : ""

  // Get thumbnail URL from metadata or use a default
  const thumbnailUrl =
    season?.preview_url ??
    "https://onconnects-media.s3.us-east-1.amazonaws.com/p/pu/8866_1735924247_32ec7af3f2b0e7462472.png"

  // Fetch episode count when component mounts
  useEffect(() => {
    const fetchEpisodeCount = async () => {
      try {
        setIsLoading(true)
        const result = await listSeasonsEpisodes({}, season.id)
        setEpisodeCount(result.count)
      } catch (error) {
        console.error("Error fetching episode count:", error)
        setEpisodeCount(0)
      } finally {
        setIsLoading(false)
      }
    }

    fetchEpisodeCount()
  }, [season.id])

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.3 }}
      className="overflow-hidden rounded-xl bg-gray-900 shadow-xl"
    >
      <LocalizedClientLink
        href={`/seasons/${season.handle}`}
        className="block h-full"
      >
        <div className="relative aspect-[16/9] w-full overflow-hidden">
          <Image
            src="/assets/preview.png"
            alt={season.name}
            fill
            className="object-cover transition-transform duration-500 hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />

          {/* Apple TV style gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-70"></div>

          {/* Season number badge */}
          {seasonNumber && (
            <div className="absolute top-4 right-4 bg-black/20 backdrop-blur-md px-3 py-1 rounded-full text-white text-sm font-medium">
              Season {seasonNumber}
            </div>
          )}
        </div>

        <div className="p-6">
          <h3 className="text-xl font-bold text-white mb-2">{season.name}</h3>
          <p className="text-white/70 text-sm line-clamp-2">
            {season?.product_variant.product?.description ||
              "Watch all episodes from this season"}
          </p>

          {/* Episodes count */}
          {isLoading ? (
            <div className="mt-4 flex items-center text-white/60 text-sm">
              <span className="animate-pulse">Loading episodes...</span>
            </div>
          ) : episodeCount > 0 ? (
            <div className="mt-4 flex items-center text-white/60 text-sm">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {episodeCount} {episodeCount === 1 ? "Episode" : "Episodes"}
            </div>
          ) : (
            <div className="mt-4 flex items-center text-white/60 text-sm">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Coming soon
            </div>
          )}
        </div>
      </LocalizedClientLink>
    </motion.div>
  )
}

export default SeasonsList
