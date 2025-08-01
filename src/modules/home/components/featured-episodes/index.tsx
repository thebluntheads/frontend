import Image from "next/image"
import { Button } from "@medusajs/ui"
import { DigitalProduct } from "types/global"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { getDigitalProductPrice } from "@lib/util/get-product-price"

interface FeaturedEpisodesProps {
  season: DigitalProduct
  episodes: DigitalProduct[]
}

const FeaturedEpisodes = ({ season, episodes }: FeaturedEpisodesProps) => {
  if (!episodes || episodes.length === 0) {
    return null
  }
  console.log({ episodes })
  return (
    <div className="py-12 px-4 md:px-8 lg:px-12 bg-black">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-white text-2xl md:text-3xl font-bold">
            Episodes
          </h2>
          {season && (
            <LocalizedClientLink href={`/seasons/${season.handle}`}>
              <Button
                variant="secondary"
                className="bg-dark-green hover:bg-light-green text-white border-0 text-sm"
              >
                View All Episodes
              </Button>
            </LocalizedClientLink>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {episodes.map((episode) => (
            <div
              key={episode.id}
              className="bg-gray-900 rounded-lg overflow-hidden transition-transform duration-200 hover:scale-[1.02]"
            >
              <div className="relative aspect-video">
                <Image
                  src={
                    episode?.product_variant?.metadata?.thumbnailUrl
                      ? (episode.product_variant.metadata
                          .thumbnailUrl as string)
                      : episode?.name.includes("1")
                      ? "/assets/episode_one_thumbnail.png"
                      : "/assets/preview.png"
                  }
                  alt={episode.name || "Episode thumbnail"}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-4">
                  <div className="text-white">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="bg-gray-800 px-2 py-1 rounded text-xs">
                        {getDigitalProductPrice({
                          variant: episode.product_variant,
                        }).cheapestPrice?.calculated_price || "$0.00"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-white text-lg font-medium mb-2 line-clamp-1">
                  {episode.name}
                </h3>
                <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                  {episode.description}
                </p>
                <LocalizedClientLink
                  href={`/seasons/${season.handle}/${episode.handle}`}
                  className="w-full"
                >
                  <Button className="w-full bg-dark-green hover:bg-light-green text-white border-none">
                    {episode?.product_variant?.metadata?.unlocked ? (
                      <span className="flex items-center gap-1">
                        Watch Now
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"
                          />
                        </svg>
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        Unlocks Soon
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                          />
                        </svg>
                      </span>
                    )}
                  </Button>
                </LocalizedClientLink>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default FeaturedEpisodes
