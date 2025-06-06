import { Metadata } from "next"
import { notFound, redirect } from "next/navigation"
import { listProducts } from "@lib/data/products"
import { getCollectionByHandle } from "@lib/data/collections"
import { getEpisode, getSeason } from "@lib/data/digital-products"
import EpisodeTemplate from "@modules/seasons/templates/episode-template"
import { retrieveCustomer } from "@lib/data/customer"

type Props = {
  params: {
    handle: string
    episodeHandle: string
    countryCode: string
  }
}

// export async function generateMetadata({ params }: Props): Promise<Metadata> {
//   const { episodeHandle, countryCode } = params

//   // Try to get the episode using standard products endpoint
//   let product = await listProducts({
//     countryCode,
//     queryParams: { handle: episodeHandle },
//   })
//     .then(({ response }) => response.products[0])
//     .catch(() => null)

//   // If not found, try using digital products endpoint
//   if (!product) {
//     product = await listDigitalProducts({
//       countryCode,
//       queryParams: { handle: episodeHandle },
//     })
//       .then(({ response }) => response.products[0])
//       .catch(() => null)
//   }

//   if (!product) {
//     notFound()
//   }

//   return {
//     title: `${product.title} | Streaming Platform`,
//     description: product.description || `Watch ${product.title}`,
//   }
// }

export default async function EpisodePage({ params }: Props) {
  const { handle, episodeHandle, countryCode } = await params
  const customer = await retrieveCustomer().catch(() => null)

  if (!customer) {
    return redirect("/account")
  }
  // Get the season collection
  const season = await getSeason({}, handle)
    .then(({ digital_products }) => digital_products[0])
    .catch(() => null)

  // Try to get the episode using standard products endpoint
  const episode = await getEpisode({}, episodeHandle)
    .then(({ digital_products }) => digital_products[0])
    .catch(() => null)

  return <EpisodeTemplate episode={episode} season={season} />
}
