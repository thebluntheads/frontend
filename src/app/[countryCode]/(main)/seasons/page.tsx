import { Metadata } from "next"
import { listSeasons } from "@lib/data/digital-products"
import { getRegion } from "@lib/data/regions"
import SeasonsList from "@modules/seasons/components/seasons-list/index"
import Hero from "@modules/home/components/hero"

export const metadata: Metadata = {
  title: "Seasons | TheBluntHeads",
  description:
    "Browse all seasons of our premium content in TheBluntHeads plateform.",
}

export default async function SeasonsPage(props: {
  params: Promise<{ countryCode: string }>
}) {
  const params = await props.params
  const { countryCode } = params
  const region = await getRegion(countryCode)

  const { digital_products } = await listSeasons()
  if (!digital_products || !region) {
    return null
  }

  // Filter collections that represent seasons and have products
  const seasons = digital_products

  // Find featured season (either marked as featured in metadata or just take the first one)
  const featuredSeason = seasons[0]

  return (
    <div className="bg-black min-h-screen">
      {/* Hero section with featured season */}
      <Hero
        title={featuredSeason?.name || "Explore Our Seasons"}
        description={
          "Discover our premium content with exclusive episodes and behind-the-scenes footage."
        }
        ctaLink={`/seasons/${featuredSeason?.product_variant?.product?.handle}`}
        ctaText="Watch Season"
        thumbnailUrl={(featuredSeason?.preview_url as string) || undefined}
      />

      {/* Seasons content */}
      <div className="py-12 px-6 md:px-12">
        <h1 className="text-4xl font-bold text-white mb-8">All Seasons</h1>
        <SeasonsList seasons={seasons} region={region} />
      </div>
    </div>
  )
}
