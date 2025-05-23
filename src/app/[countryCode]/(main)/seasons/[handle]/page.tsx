import { Metadata } from "next"
import { notFound } from "next/navigation"

import { getCollectionByHandle, listCollections } from "@lib/data/collections"
import { listRegions } from "@lib/data/regions"
import { StoreCollection, StoreRegion } from "@medusajs/types"
import {
  getSeason,
  listDigitalProductCollections,
} from "@lib/data/digital-products"
import SeasonTemplate from "@modules/seasons/templates"

type Props = {
  params: Promise<{ handle: string; countryCode: string }>
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params
  const { digital_products } = await getSeason({}, params.handle)

  if (!digital_products) {
    notFound()
  }

  const metadata = {
    title: `${digital_products[0].name} | TheBluntHeads`,
    description:
      (digital_products?.[0]?.description as string) ||
      `Watch episodes from ${digital_products[0].name}`,
  } as Metadata

  return metadata
}

export default async function SeasonPage(props: Props) {
  const params = await props.params

  const { digital_products, count } = await getSeason({}, params.handle)

  return (
    <SeasonTemplate
      season={digital_products[0]}
      countryCode={params.countryCode}
    />
  )
}
