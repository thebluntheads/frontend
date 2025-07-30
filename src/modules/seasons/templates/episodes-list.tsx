import { HttpTypes, StoreProduct } from "@medusajs/types"
import Image from "next/image"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { Button } from "@medusajs/ui"
import { getProductPrice } from "@lib/util/get-product-price"
import { convertToLocale } from "@lib/util/money"
import { DigitalProduct } from "types/global"

export interface EpisodeMetadata {
  duration?: string
  episode_number?: string
  preview_url?: string
  thumbnail_url?: string
}

export interface EpisodesListProps {
  products: DigitalProduct[]
  season_handle: string
  region: HttpTypes.StoreRegion
}

export default function EpisodesList({
  products,
  season_handle,
  region,
}: EpisodesListProps) {
  return (
    <div className="space-y-6 animate-fade-in">
      {products.map((episode, index) => {
        const { cheapestPrice } = getProductPrice({
          product: episode.product_variant.product as StoreProduct,
        })
        const formattedPrice = cheapestPrice
          ? convertToLocale({
              amount: Number(cheapestPrice.calculated_price) / 100, // Convert from cents to dollars
              currency_code: region.currency_code,
            })
          : "N/A"
        const thumbnailUrl = episode?.product_variant?.metadata?.thumbnailUrl
          ? (episode.product_variant.metadata.thumbnailUrl as string)
          : episode?.name.includes("1")
          ? "/assets/episode_one_thumbnail.png"
          : "/assets/preview.png"

        return (
          <div
            key={episode.id}
            className="bg-black/5 rounded-xl overflow-hidden hover:bg-black/10 transition-all duration-300 animate-fade-in h-full"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <LocalizedClientLink
              href={`/seasons/${season_handle}/${episode?.handle}`}
              className="block"
            >
              <div className="flex flex-col md:flex-row">
                {/* Episode Thumbnail */}
                <div className="relative w-full md:w-80 h-48 md:h-44 flex-shrink-0">
                  <Image
                    src={thumbnailUrl || "/placeholder-image.jpg"}
                    alt={episode.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 320px"
                  />

                  <div className="absolute top-2 left-2 bg-black/20 backdrop-blur-md text-white text-xs px-2 py-1 rounded">
                    {episode.name}
                  </div>
                </div>

                {/* Episode Details */}
                <div className="p-4 flex flex-col justify-between flex-grow w-full">
                  <div>
                    <h3 className="text-xl font-medium text-white mb-2">
                      {episode.name}
                    </h3>
                    <p className="text-white/70 text-sm mb-4 line-clamp-2">
                      {episode.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-white/90">
                      {cheapestPrice && <span>{formattedPrice}</span>}
                    </div>

                    <div className="flex space-x-3">
                      {episode?.preview_url && (
                        <Button
                          variant="secondary"
                          className="bg-black/10 hover:bg-black/20 text-white border-0 text-sm"
                        >
                          Preview
                        </Button>
                      )}
                      <Button
                        variant="secondary"
                        className="bg-dark-green hover:bg-light-green text-white border-0 text-sm"
                      >
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
                    </div>
                  </div>
                </div>
              </div>
            </LocalizedClientLink>
          </div>
        )
      })}
    </div>
  )
}
