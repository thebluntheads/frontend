import { HttpTypes } from "@medusajs/types"
import { Heading, Text } from "@medusajs/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

type ProductInfoProps = {
  product: HttpTypes.StoreProduct
}

const ProductInfo = ({ product }: ProductInfoProps) => {
  return (
    <div id="product-info">
      <div className="flex flex-col gap-y-6">
        {product.collection && (
          <LocalizedClientLink
            href={`/collections/${product.collection.handle}`}
            className="text-light-green hover:text-light-green transition-colors duration-200 text-sm font-medium"
          >
            {product.collection.title}
          </LocalizedClientLink>
        )}
        <div>
          <Heading
            level="h2"
            className="text-3xl leading-10 text-white font-bold"
            data-testid="product-title"
          >
            {product.title}
          </Heading>

          <div className="flex items-center mt-2 space-x-4">
            {product.tags && product.tags.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {product.tags.map((tag) => (
                  <span
                    key={tag.id}
                    className="bg-white/10 text-white/80 text-xs px-2 py-1 rounded-full"
                  >
                    {tag.value}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <Text
          className="text-white/70 whitespace-pre-line text-base leading-relaxed"
          data-testid="product-description"
        >
          {product.description}
        </Text>
      </div>
    </div>
  )
}

export default ProductInfo
