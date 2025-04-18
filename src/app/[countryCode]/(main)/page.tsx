import { Metadata } from "next"

import FeaturedProducts from "@modules/home/components/featured-products"
import Hero from "@modules/home/components/hero"
import HomeClient from "@modules/home/components/home-client"
import { listCollections } from "@lib/data/collections"
import { getRegion } from "@lib/data/regions"
import {
  listDigitalProductCollections,
  listSeasons,
  listSeasonsEpisodes,
  listSounds,
} from "@lib/data/digital-products"
import FeaturedEpisodes from "@modules/home/components/featured-episodes"
import FeaturedSounds from "@modules/home/components/featured-sounds"
import { FeaturedPlayer } from "@modules/home/components/featured-player"

export const metadata: Metadata = {
  title: "TheBluntHeads",
  description: "Experience premium series on our plateform TheBluntHeads.",
  openGraph: {
    title: "TheBluntHeads",
    description: "Experience premium cannabis-culture animated content, music, and exclusive digital products.",
    images: [{
      url: "https://onconnects-media.s3.us-east-1.amazonaws.com/p/pu/8866_1735924247_32ec7af3f2b0e7462472.png",
      width: 1200,
      height: 630,
      alt: "TheBluntHeads"
    }],
    type: "website",
    siteName: "TheBluntHeads"
  },
  twitter: {
    card: "summary_large_image",
    title: "TheBluntHeads",
    description: "Experience premium cannabis-culture animated content, music, and exclusive digital products.",
    images: ["https://onconnects-media.s3.us-east-1.amazonaws.com/p/pu/8866_1735924247_32ec7af3f2b0e7462472.png"]
  }
}

export default async function Home(props: {
  params: Promise<{ countryCode: string }>
}) {
  const params = await props.params

  const { countryCode } = params

  const region = await getRegion(countryCode)

  // Get featured season
  const { digital_products: seasons } = await listSeasons({}, "season-1")
  if (!seasons || !region) {
    return null
  }
  const featuredSeason = seasons[0]

  // Get episodes for the featured season
  const { digital_products: episodes } = await listSeasonsEpisodes(
    {},
    featuredSeason?.id || ""
  )

  const { digital_products: sounds } = await listSounds()

  return (
    <div className="bg-black min-h-screen">
      {/* Promotional popup banner - client component */}
      <HomeClient countryCode={countryCode} />

      {/* Hero section with featured season */}
      <Hero
        title={featuredSeason?.name}
        description={featuredSeason?.description}
        episodeCount={episodes?.length || 0}
        seasonHandle={featuredSeason?.handle}
        ctaText="Watch Season"
      />

      {/* Featured episodes section */}
      {episodes && episodes.length > 0 && (
        <FeaturedEpisodes season={featuredSeason} episodes={episodes} />
      )}

      {/* Featured sounds section */}
      {sounds && sounds.length > 0 && <FeaturedPlayer />}
    </div>
  )
}
