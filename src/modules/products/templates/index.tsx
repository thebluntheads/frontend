import React, { Suspense } from "react"

import ImageGallery from "@modules/products/components/image-gallery"
import ProductActions from "@modules/products/components/product-actions"
import ProductOnboardingCta from "@modules/products/components/product-onboarding-cta"
import ProductTabs from "@modules/products/components/product-tabs"
import RelatedProducts from "@modules/products/components/related-products"
import ProductInfo from "@modules/products/templates/product-info"
import SkeletonRelatedProducts from "@modules/skeletons/templates/skeleton-related-products"
import { notFound } from "next/navigation"
import ProductActionsWrapper from "./product-actions-wrapper"
import { HttpTypes } from "@medusajs/types"

type ProductTemplateProps = {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  countryCode: string
}

const ProductTemplate: React.FC<ProductTemplateProps> = ({
  product,
  region,
  countryCode,
}) => {
  if (!product || !product.id) {
    return notFound()
  }

  return (
    <>
      <div
        className="content-container py-10 relative"
        data-testid="product-container"
      >
        {/* Product Hero Section */}
        <div className="bg-black/30 backdrop-blur-md rounded-xl p-8 border border-white/10 shadow-xl mb-12">
          <div className="flex flex-col small:flex-row small:items-start gap-8">
            {/* Product Images */}
            <div className="block w-full small:w-3/5 relative rounded-lg overflow-hidden border border-white/5">
              <ImageGallery images={product?.images || []} />
            </div>
            
            {/* Product Info & Actions */}
            <div className="flex flex-col w-full small:w-2/5 gap-y-8">
              <div className="bg-black/20 backdrop-blur-sm rounded-xl p-6 border border-white/5 shadow-lg">
                <ProductInfo product={product} />
              </div>
              
              <div className="bg-black/20 backdrop-blur-sm rounded-xl p-6 border border-white/5 shadow-lg">
                <ProductOnboardingCta />
                <Suspense
                  fallback={
                    <ProductActions
                      disabled={true}
                      product={product}
                      region={region}
                    />
                  }
                >
                  <ProductActionsWrapper id={product.id} region={region} />
                </Suspense>
              </div>
            </div>
          </div>
        </div>
        
        {/* Product Details Section */}
        <div className="bg-black/20 backdrop-blur-sm rounded-xl p-6 border border-white/5 shadow-lg mb-12">
          <ProductTabs product={product} />
        </div>
        
        {/* Related Products Section */}
        <div
          className="my-8"
          data-testid="related-products-container"
        >
          <h2 className="text-[2rem] leading-[2.5rem] font-bold text-white mb-6">You might also like</h2>
          <div className="bg-black/20 backdrop-blur-sm rounded-xl p-6 border border-white/5 shadow-lg">
            <Suspense fallback={<SkeletonRelatedProducts />}>
              <RelatedProducts product={product} countryCode={countryCode} />
            </Suspense>
          </div>
        </div>
      </div>
    </>
  )
}

export default ProductTemplate
