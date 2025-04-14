"use server"

import { HttpTypes } from "@medusajs/types"
import { DigitalProduct } from "../../types/global"
import { sdk, streamSDK } from "../config"
import { getAuthHeaders, getCacheOptions } from "./cookies"
import { getRegion, retrieveRegion } from "./regions"

export const getCustomerDigitalProducts = async (
  product_id?: string,
  parent_id?: string
) => {
  console.log({ parent_id })
  const headers = {
    ...(await getAuthHeaders()),
  }

  const next = {
    ...(await getCacheOptions("products")),
  }
  const { digital_product } = await sdk.client.fetch<{
    digital_product: DigitalProduct
  }>(
    `/store/customers/me/digital-products?product_id=${product_id}&parent_id=${parent_id}`,
    {
      headers,
      next,
      cache: "force-cache",
    }
  )

  return digital_product as DigitalProduct
}

export const getDigitalProductByMediaType = async (mediaType: string) => {
  const headers = {
    ...(await getAuthHeaders()),
  }

  const next = {
    ...(await getCacheOptions("products")),
  }
  const { url } = await sdk.client.fetch<{
    url: string
  }>(`/store/customers/me/digital-products/${mediaType}/download`, {
    method: "POST",
    headers,
    next,
    cache: "force-cache",
  })

  return url
}

export const listDigitalProducts = async ({
  pageParam = 1,
  queryParams,
  countryCode,
  regionId,
}: {
  pageParam?: number
  queryParams?: HttpTypes.FindParams & HttpTypes.StoreProductListParams
  countryCode?: string
  regionId?: string
}): Promise<{
  response: { products: HttpTypes.StoreProduct[]; count: number }
  nextPage: number | null
  queryParams?: HttpTypes.FindParams & HttpTypes.StoreProductListParams
}> => {
  if (!countryCode && !regionId) {
    throw new Error("Country code or region ID is required")
  }

  const limit = queryParams?.limit || 12
  const _pageParam = Math.max(pageParam, 1)
  const offset = _pageParam === 1 ? 0 : (_pageParam - 1) * limit

  let region: HttpTypes.StoreRegion | undefined | null

  if (countryCode) {
    region = await getRegion(countryCode)
  } else {
    region = await retrieveRegion(regionId!)
  }

  if (!region) {
    return {
      response: { products: [], count: 0 },
      nextPage: null,
    }
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  const next = {
    ...(await getCacheOptions("products")),
  }
  return sdk.client
    .fetch<{ products: HttpTypes.StoreProduct[]; count: number }>(
      `/store/products`,
      {
        method: "GET",
        query: {
          limit,
          offset,
          region_id: region?.id,
          type_id: undefined,
          fields:
            "*variants.calculated_price,+variants.inventory_quantity,+metadata,+tags,*variants.calculated_price,*variants.digital_product, *variants.digital_product.*",
          ...queryParams,
        },
        headers,
        next,
        cache: "force-cache",
      }
    )
    .then(({ products, count }) => {
      const nextPage = count > offset + limit ? pageParam + 1 : null

      return {
        response: {
          products,
          count,
        },
        nextPage: nextPage,
        queryParams,
      }
    })
}

export const listDigitalProductCollections = async (
  queryParams: Record<string, string> = {}
): Promise<{ collections: HttpTypes.StoreCollection[]; count: number }> => {
  const next = {
    ...(await getCacheOptions("collections")),
  }

  queryParams.limit = queryParams.limit || "100"
  queryParams.offset = queryParams.offset || "0"

  return sdk.client
    .fetch<{ collections: HttpTypes.StoreCollection[]; count: number }>(
      "/store/collections",
      {
        query: {
          ...queryParams,
          fields: "id,handle,title,metadata,*products",
        },
        next,
      }
    )
    .then(({ collections }) => {
      console.log("waaaa", { collections })
      return {
        // Filter out collections with no products
        collections: collections.filter(
          (collection) => collection.products && collection.products.length > 0
        ),
        count: collections.length,
      }
    })
}

export const listSeasons = async (
  queryParams: Record<string, string> = {},
  handle?: string
): Promise<{ digital_products: DigitalProduct[]; count: number }> => {
  const next = {
    ...(await getCacheOptions("seasons")),
  }

  queryParams.limit = queryParams.limit || "100"
  queryParams.offset = queryParams.offset || "0"

  const url = handle
    ? `/store/digital-products?type=season&handle=${handle}`
    : `/store/digital-products?type=season`
  return sdk.client
    .fetch<{ digital_products: DigitalProduct[]; count: number }>(url, {
      query: {
        ...queryParams,
      },
      next,
    })
    .then(({ digital_products }) => {
      console.log("waaaa", { digital_products })
      return {
        digital_products,
        count: digital_products.length,
      }
    })
}

export const listEpisodes = async (
  queryParams: Record<string, string> = {},
  seasonHandle?: string,
  options: Record<string, string> = {}
): Promise<{ digital_products: DigitalProduct[]; count: number }> => {
  const next = {
    ...(await getCacheOptions("episodes")),
  }
  
  // Apply options to query params
  queryParams.limit = options.limit || queryParams.limit || "100"
  queryParams.offset = options.offset || queryParams.offset || "0"

  // Build URL based on whether we're filtering by season
  const url = seasonHandle
    ? `/store/digital-products?type=episode&season_handle=${seasonHandle}`
    : `/store/digital-products?type=episode`
    
  return sdk.client
    .fetch<{ digital_products: DigitalProduct[]; count: number }>(url, {
      query: {
        ...queryParams,
      },
      next,
    })
    .then(({ digital_products }) => {
      return {
        digital_products,
        count: digital_products.length,
      }
    })
}

export const listSeasonsEpisodes = async (
  queryParams: Record<string, string> = {},
  parent_id: string
): Promise<{ digital_products: DigitalProduct[]; count: number }> => {
  const next = {
    ...(await getCacheOptions("epsiodes")),
  }

  queryParams.limit = queryParams.limit || "100"
  queryParams.offset = queryParams.offset || "0"

  return sdk.client
    .fetch<{ digital_products: DigitalProduct[]; count: number }>(
      `/store/digital-products?type=episode&parent_id=${parent_id}`,
      {
        query: {
          ...queryParams,
        },
        next,
      }
    )
    .then(({ digital_products }) => {
      return {
        // Filter out collections with no products
        digital_products: digital_products.filter(
          (digital_product) =>
            digital_product && digital_product.product_variant.id
        ),
        count: digital_products.length,
      }
    })
}

export const getSeason = async (
  queryParams: Record<string, string> = {},
  handle: string
): Promise<{ digital_products: DigitalProduct[]; count: number }> => {
  const next = {
    ...(await getCacheOptions("season")),
  }

  queryParams.limit = queryParams.limit || "100"
  queryParams.offset = queryParams.offset || "0"

  return sdk.client
    .fetch<{ digital_products: DigitalProduct[]; count: number }>(
      `/store/digital-products?handle=${handle}`,
      {
        query: {
          ...queryParams,
        },
        next,
      }
    )
    .then(({ digital_products }) => {
      return {
        // Filter out collections with no products
        digital_products: digital_products.filter(
          (digital_product) =>
            digital_product && digital_product.product_variant.id
        ),
        count: digital_products.length,
      }
    })
}

export const getEpisode = async (
  queryParams: Record<string, string> = {},
  handle: string
): Promise<{ digital_products: DigitalProduct[]; count: number }> => {
  const next = {
    ...(await getCacheOptions("episode")),
  }

  queryParams.limit = queryParams.limit || "100"
  queryParams.offset = queryParams.offset || "0"

  return sdk.client
    .fetch<{ digital_products: DigitalProduct[]; count: number }>(
      `/store/digital-products?handle=${handle}`,
      {
        query: {
          ...queryParams,
        },
        next,
      }
    )
    .then(({ digital_products }) => {
      return {
        // Filter out collections with no products
        digital_products: digital_products.filter(
          (digital_product) =>
            digital_product && digital_product.product_variant.id
        ),
        count: digital_products.length,
      }
    })
}

export const listSounds = async (
  queryParams: Record<string, string> = {},
  parent_id?: string
): Promise<{ digital_products: DigitalProduct[]; count: number }> => {
  const next = {
    ...(await getCacheOptions("sounds")),
  }

  const url = parent_id
    ? `/store/digital-products?type=sound&parent_id=${parent_id}`
    : `/store/digital-products?type=sound`

  return sdk.client
    .fetch<{ digital_products: DigitalProduct[]; count: number }>(url, {
      query: {
        ...queryParams,
      },
      next,
    })
    .then(({ digital_products }) => {
      return {
        digital_products: digital_products.filter(
          (digital_product) =>
            digital_product && digital_product.product_variant.id
        ),
        count: digital_products.length,
      }
    })
}

export const listAlbums = async (
  albumName: string = "",
  queryParams: Record<string, string> = {}
): Promise<{ digital_products: DigitalProduct[]; count: number }> => {
  const next = {
    ...(await getCacheOptions("albums")),
  }

  queryParams.limit = queryParams.limit || "100"
  queryParams.offset = queryParams.offset || "0"

  if (albumName) {
    queryParams.album = albumName
  }

  return sdk.client
    .fetch<{ digital_products: DigitalProduct[]; count: number }>(
      `/store/digital-products?type=album`,
      {
        query: {
          ...queryParams,
        },
        next,
      }
    )
    .then(({ digital_products }) => {
      return {
        digital_products: digital_products.filter(
          (digital_product) =>
            digital_product && digital_product.product_variant.id
        ),
        count: digital_products.length,
      }
    })
}

export const getSound = async (
  handle: string,
  queryParams: Record<string, string> = {}
): Promise<DigitalProduct | null> => {
  const next = {
    ...(await getCacheOptions("sound")),
  }

  try {
    const { digital_products } = await sdk.client.fetch<{
      digital_products: DigitalProduct[]
      count: number
    }>(`/store/digital-products?handle=${handle}`, {
      query: {
        ...queryParams,
      },
      next,
    })

    if (!digital_products || digital_products.length === 0) {
      return null
    }

    return digital_products[0]
  } catch (error) {
    console.error("Error fetching sound:", error)
    return null
  }
}
