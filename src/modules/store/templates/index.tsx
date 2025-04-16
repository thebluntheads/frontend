import { Suspense } from "react"

import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import RefinementList from "@modules/store/components/refinement-list"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"

import PaginatedProducts from "./paginated-products"

const StoreTemplate = ({
  sortBy,
  page,
  countryCode,
}: {
  sortBy?: SortOptions
  page?: string
  countryCode: string
}) => {
  const pageNumber = page ? parseInt(page) : 1
  const sort = sortBy || "created_at"

  return (
    <div
      className="flex flex-col small:flex-row small:items-start py-10 content-container"
      data-testid="category-container"
    >
      <div className="small:sticky small:top-20">
        <div className="bg-black/30 backdrop-blur-md rounded-xl shadow-lg border border-white/10 p-6 mb-6">
          <RefinementList sortBy={sort} />
        </div>
      </div>
      <div className="w-full small:pl-8">
        <div className="mb-8">
          <h1
            className="text-[2.5rem] leading-[3rem] font-bold text-white"
            data-testid="store-page-title"
          >
            Blunt Heads Shop
          </h1>
          <p className="text-white/70 mt-2 text-lg">
            Gear up with official merch.
          </p>
        </div>
        <div className="bg-black/20 backdrop-blur-sm rounded-xl p-6 border border-white/5 shadow-xl">
          <Suspense fallback={<SkeletonProductGrid />}>
            <PaginatedProducts
              sortBy={sort}
              page={pageNumber}
              countryCode={countryCode}
            />
          </Suspense>
        </div>
      </div>
    </div>
  )
}

export default StoreTemplate
