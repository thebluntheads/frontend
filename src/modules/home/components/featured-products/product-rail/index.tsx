import { listDigitalProducts } from "@lib/data/digital-products"
import { listProducts } from "@lib/data/products"
import { HttpTypes } from "@medusajs/types"
import { Text } from "@medusajs/ui"

import InteractiveLink from "@modules/common/components/interactive-link"
import ProductPreview from "@modules/products/components/product-preview"

export default async function ProductRail({
  collection,
  region,
}: {
  collection: HttpTypes.StoreCollection
  region: HttpTypes.StoreRegion
}) {
  const {
    response: { products: pricedProducts },
  } = await listDigitalProducts({
    regionId: region.id,
    queryParams: {
      collection_id: collection.id,
      fields: "*variants.calculated_price",
    },
  })

  if (!pricedProducts) {
    return null
  }

  return (
    <div className="py-8 px-8 md:px-12">
      <div className="flex justify-between items-center mb-6">
        <div>
          <Text className="text-xl font-medium text-white">
            {collection.title}
          </Text>
        </div>
        <InteractiveLink href={`/collections/${collection.handle}`}>
          See All
        </InteractiveLink>
      </div>
      <div className="relative">
        <div className="overflow-x-auto pb-4 hide-scrollbar">
          <ul className="flex space-x-4 md:space-x-6">
            {pricedProducts &&
              pricedProducts.map((product) => (
                <li
                  key={product.id}
                  className="flex-shrink-0 w-[200px] md:w-[240px] lg:w-[280px]"
                >
                  <ProductPreview
                    product={product}
                    region={region}
                    isFeatured
                  />
                </li>
              ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
