import { listProducts } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import { HttpTypes } from "@medusajs/types"
import Product from "../product-preview"

type RelatedProductsProps = {
  product: HttpTypes.StoreProduct
  countryCode: string
}

export default async function RelatedProducts({
  product,
  countryCode,
}: RelatedProductsProps) {
  const region = await getRegion(countryCode)

  if (!region) {
    return null
  }

  // edit this function to define your related products logic
  const queryParams: Record<string, any> = {}
  if (region?.id) {
    queryParams.region_id = region.id
  }
  if (product.collection_id) {
    queryParams.collection_id = [product.collection_id]
  }
  if (product.tags) {
    queryParams.tags = product.tags
      .map((t) => t.id)
      .filter(Boolean) as string[]
  }
  queryParams.is_giftcard = false

  const products = await listProducts({
    queryParams,
    countryCode,
  }).then(({ response }) => {
    return response.products.filter(
      (responseProduct) => responseProduct.id !== product.id
    )
  })

  if (!products.length) {
    return null
  }

  return (
    <div className="w-full">
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-white mb-3">Related Products</h3>
        <p className="text-white/70 max-w-2xl">
          You might also want to check out these products that complement your selection.
        </p>
      </div>

      <ul className="grid grid-cols-1 small:grid-cols-2 gap-6">
        {products.slice(0, 4).map((product) => (
          <li key={product.id} className="group">
            <div className="bg-black/30 backdrop-blur-sm rounded-xl overflow-hidden border border-white/5 transition-all duration-300 group-hover:border-white/20 group-hover:shadow-lg">
              <Product region={region} product={product} />
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
