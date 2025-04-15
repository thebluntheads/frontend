import { Text } from "@medusajs/ui"
import { getProductPrice } from "@lib/util/get-product-price"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Thumbnail from "../thumbnail"
import PreviewPrice from "./price"
import React from "react"

export default async function ProductPreview({
  product,
  isFeatured,
  region,
}: {
  product: HttpTypes.StoreProduct
  isFeatured?: boolean
  region: HttpTypes.StoreRegion
}) {
  const { cheapestPrice } = getProductPrice({
    product,
  })

  return (
    <LocalizedClientLink
      href={`/products/${product.handle}`}
      className="group relative block h-full"
    >
      <div
        data-testid="product-wrapper"
        className="relative h-full flex flex-col md:flex-row bg-black/30 backdrop-blur-sm rounded-xl overflow-hidden border border-white/5 transition-all duration-300 group-hover:border-white/20 group-hover:shadow-lg"
      >
        <div className="relative overflow-hidden md:w-2/5">
          <Thumbnail
            thumbnail={product.thumbnail}
            images={product.images}
            size="full"
            isFeatured={isFeatured}
            className="transition-transform duration-500 group-hover:scale-110 h-full object-cover"
          />
          {/* New tag can be conditionally shown based on product creation date */}
          {product.created_at &&
            new Date(product.created_at).getTime() >
              Date.now() - 30 * 24 * 60 * 60 * 1000 && (
              <div className="absolute top-3 right-3 bg-dark-green/80 backdrop-blur-sm text-white text-xs font-medium py-1 px-2 rounded-full">
                New
              </div>
            )}
        </div>

        <div className="p-6 flex-1 flex flex-col justify-between md:w-3/5">
          <div>
            <Text
              className="text-white font-medium text-lg group-hover:text-light-green transition-colors duration-300"
              data-testid="product-title"
            >
              {product.title}
            </Text>
            <p className="text-white/60 text-sm mt-1 line-clamp-2">
              {product.description?.substring(0, 60)}
              {product.description && product.description.length > 60
                ? "..."
                : ""}
            </p>
          </div>
          <div className="flex items-center justify-between mt-4">
            {cheapestPrice && (
              <div className="flex items-center">
                <div className="text-white font-semibold">
                  <PreviewPrice price={cheapestPrice} />
                </div>
              </div>
            )}
            <div className="bg-white/10 hover:bg-white/20 transition-colors duration-300 rounded-full p-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </LocalizedClientLink>
  )
}
