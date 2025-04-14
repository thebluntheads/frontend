import { clx } from "@medusajs/ui"

import { getProductPrice } from "@lib/util/get-product-price"
import { HttpTypes } from "@medusajs/types"

export default function ProductPrice({
  product,
  variant,
}: {
  product: HttpTypes.StoreProduct
  variant?: HttpTypes.StoreProductVariant
}) {
  const { cheapestPrice, variantPrice } = getProductPrice({
    product,
    variantId: variant?.id,
  })

  const selectedPrice = variant ? variantPrice : cheapestPrice

  if (!selectedPrice) {
    return <div className="block w-32 h-9 bg-gray-100 animate-pulse" />
  }

  return (
    <div className="flex flex-col bg-black/20 backdrop-blur-sm rounded-lg p-4 border border-white/10 my-4">
      <span
        className={clx("text-2xl font-bold", {
          "text-green-400": selectedPrice.price_type === "sale",
          "text-white": selectedPrice.price_type !== "sale"
        })}
      >
        {!variant && "From "}
        <span
          data-testid="product-price"
          data-value={selectedPrice.calculated_price_number}
        >
          {selectedPrice.calculated_price}
        </span>
      </span>
      {selectedPrice.price_type === "sale" && (
        <>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-white/70">Original: </span>
            <span
              className="line-through text-white/50"
              data-testid="original-product-price"
              data-value={selectedPrice.original_price_number}
            >
              {selectedPrice.original_price}
            </span>
            <span className="bg-green-500/20 text-green-400 text-sm font-medium px-2 py-1 rounded-full">
              -{selectedPrice.percentage_diff}% OFF
            </span>
          </div>
        </>
      )}
    </div>
  )
}
