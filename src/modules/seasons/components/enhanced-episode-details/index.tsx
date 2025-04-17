"use client"

import { Button } from "@medusajs/ui"
import Image from "next/image"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { DigitalProduct } from "types/global"

interface EnhancedEpisodeDetailsProps {
  episode: DigitalProduct
  season: DigitalProduct
  relatedEpisodes?: DigitalProduct[]
  hasPurchased?: boolean
}

const EnhancedEpisodeDetails = ({
  episode,
  season,
  relatedEpisodes = [],
  hasPurchased = false,
}: EnhancedEpisodeDetailsProps) => {
  return (
    <div className="py-12">
      <div className="max-w-7xl mx-auto">
        {/* Episode details section */}
        <div className="mb-16">
          <h2 className="text-white text-2xl font-bold mb-6">
            About This Episode
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="col-span-2">
              <p className="text-gray-300 text-lg leading-relaxed mb-6">
                {episode.description ||
                  "Experience this captivating episode from our exclusive collection. Dive deeper into the story and enjoy premium content created just for you."}
              </p>

              <div className="bg-gray-900 p-6 rounded-lg">
                <h3 className="text-white text-lg font-medium mb-4">
                  Episode Details
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-400 text-sm">Episode</p>
                    <p className="text-white">{episode.name || ""}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Season</p>
                    <p className="text-white">{season.name || ""}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Duration</p>
                    <p className="text-white">
                      {(episode?.product_variant?.metadata
                        ?.duration as string) || "45min"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Artist</p>
                    <p className="text-white">
                      {(episode?.product_variant?.metadata?.artist as string) ||
                        "TheBluntHeads"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-900 p-6 rounded-lg">
              <h3 className="text-white text-lg font-medium mb-4">
                Season Information
              </h3>
              <p className="text-gray-300 mb-4">
                {season.description ||
                  "Join us for an extraordinary season of premium content."}
              </p>
              <LocalizedClientLink href={`/seasons/${season.handle}`}>
                <Button className="w-full bg-gray-800 hover:bg-gray-700 text-white border-none">
                  View All Episodes
                </Button>
              </LocalizedClientLink>
            </div>
          </div>
        </div>

        {/* Related episodes section */}
        {relatedEpisodes.length > 0 && (
          <div className="mb-16">
            <h2 className="text-white text-2xl font-bold mb-6">
              More Episodes From This Season
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {relatedEpisodes.map((ep) => (
                <div
                  key={ep.id}
                  className="bg-gray-900 rounded-lg overflow-hidden transition-transform duration-200 hover:scale-[1.02]"
                >
                  <div className="relative aspect-video">
                    <Image
                      src={"/assets/preview.png"}
                      alt={ep.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-4">
                      <div className="text-white">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="bg-gray-800 px-2 py-1 rounded text-xs">
                            Episode {ep.position || ""}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-white text-lg font-medium mb-2 line-clamp-1">
                      {ep.name}
                    </h3>
                    <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                      {ep.description}
                    </p>
                    <LocalizedClientLink
                      href={`/seasons/${season.handle}/episodes/${ep.handle}`}
                      className="w-full"
                    >
                      <Button className="w-full bg-dark-green hover:bg-light-green text-white border-none">
                        {hasPurchased
                          ? episode?.product_variant.product?.metadata?.unlocked
                            ? "Watch Now"
                            : "Unlocks Soon"
                          : "View Details"}
                      </Button>
                    </LocalizedClientLink>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Call to action section */}
        <div className="bg-gray-900 rounded-lg p-8 text-center mb-16">
          <h2 className="text-white text-2xl font-bold mb-4">
            Explore Our Complete Collection
          </h2>
          <p className="text-gray-300 text-lg mb-6 max-w-2xl mx-auto">
            Discover more premium content including exclusive episodes, sounds,
            and products.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <LocalizedClientLink href="/seasons">
              <Button className="bg-gray-800 hover:bg-gray-700 text-white border-none px-6">
                Browse Seasons
              </Button>
            </LocalizedClientLink>
            <LocalizedClientLink href="/sounds">
              <Button className="bg-gray-800 hover:bg-gray-700 text-white border-none px-6">
                Explore Music
              </Button>
            </LocalizedClientLink>
            <LocalizedClientLink href="/products">
              <Button className="bg-gray-800 hover:bg-gray-700 text-white border-none px-6">
                Shop Products
              </Button>
            </LocalizedClientLink>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EnhancedEpisodeDetails
