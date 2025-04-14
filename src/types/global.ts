import { StorePrice, StoreProductVariant } from "@medusajs/types"

export type FeaturedProduct = {
  id: string
  title: string
  handle: string
  thumbnail?: string
}

export type VariantPrice = {
  calculated_price_number: number
  calculated_price: string
  original_price_number: number
  original_price: string
  currency_code: string
  price_type: string
  percentage_diff: string
}

export type StoreFreeShippingPrice = StorePrice & {
  target_reached: boolean
  target_remaining: number
  remaining_percentage: number
}

export type DigitalProductMedia = {
  id: string
  fileId: string
  type: "preview" | "main"
  mimeType: string
  digitalProduct?: DigitalProduct[]
}

export type DigitalProductPreview = DigitalProductMedia & {
  url: string
}

export type VariantWithDigitalProduct = StoreProductVariant & {
  digital_product?: DigitalProduct
}

// Possible digital product types
type DigitalProductType = "season" | "episode" | "album" | "sound"

interface Season extends DigitalProduct {
  type: "season"
  parent_id: null
}

interface Episode extends DigitalProduct {
  type: "episode"
  parent_id: null
}

interface Album extends DigitalProduct {
  type: "album"
  parent_id: null
}

interface Sound extends DigitalProduct {
  type: "sound"
  parent_id: string // ID of an album
  preview_url?: string
}

type DigitalProductUnion = Season | Episode | Album | Sound

// Base structure
export interface DigitalProduct {
  id: string
  name: string
  position: string
  type: DigitalProductType
  parent_id: string | null
  preview_url?: string
  content_url?: string
  product_variant: StoreProductVariant
  description: string
  handle: string
}
