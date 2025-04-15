"use client"

import Back from "@modules/common/icons/back"
import FastDelivery from "@modules/common/icons/fast-delivery"
import Refresh from "@modules/common/icons/refresh"

import Accordion from "./accordion"
import { HttpTypes } from "@medusajs/types"

type ProductTabsProps = {
  product: HttpTypes.StoreProduct
}

const ProductTabs = ({ product }: ProductTabsProps) => {
  const tabs = [
    {
      label: "Product Information",
      component: <ProductInfoTab product={product} />,
    },
    {
      label: "Shipping & Returns",
      component: <ShippingInfoTab />,
    },
  ]

  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold text-white mb-6">Product Details</h2>
      <Accordion type="multiple" className="space-y-4">
        {tabs.map((tab, i) => (
          <Accordion.Item
            key={i}
            title={tab.label}
            headingSize="medium"
            value={tab.label}
            className="bg-black/20 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden transition-all duration-300 hover:border-white/20"
          >
            {tab.component}
          </Accordion.Item>
        ))}
      </Accordion>
    </div>
  )
}

const ProductInfoTab = ({ product }: ProductTabsProps) => {
  return (
    <div className="py-6 px-2 text-white/80">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex flex-col gap-y-6">
          <div className="bg-black/20 backdrop-blur-sm rounded-lg p-4 border border-white/5">
            <span className="font-semibold text-white block mb-2">
              Material
            </span>
            <p>{product.material ? product.material : "-"}</p>
          </div>
          <div className="bg-black/20 backdrop-blur-sm rounded-lg p-4 border border-white/5">
            <span className="font-semibold text-white block mb-2">
              Country of origin
            </span>
            <p>{product.origin_country ? product.origin_country : "-"}</p>
          </div>
          <div className="bg-black/20 backdrop-blur-sm rounded-lg p-4 border border-white/5">
            <span className="font-semibold text-white block mb-2">Type</span>
            <p>{product.type ? product.type.value : "-"}</p>
          </div>
        </div>
        <div className="flex flex-col gap-y-6">
          <div className="bg-black/20 backdrop-blur-sm rounded-lg p-4 border border-white/5">
            <span className="font-semibold text-white block mb-2">Weight</span>
            <p>{product.weight ? `${product.weight} g` : "-"}</p>
          </div>
          <div className="bg-black/20 backdrop-blur-sm rounded-lg p-4 border border-white/5">
            <span className="font-semibold text-white block mb-2">
              Dimensions
            </span>
            <p>
              {product.length && product.width && product.height
                ? `${product.length}L x ${product.width}W x ${product.height}H`
                : "-"}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

const ShippingInfoTab = () => {
  return (
    <div className="py-6 px-2 text-white/80">
      <div className="grid grid-cols-1 gap-6">
        <div className="bg-black/20 backdrop-blur-sm rounded-lg p-5 border border-white/5 flex items-start gap-x-4">
          <div className="bg-blue-500/20 p-3 rounded-full">
            <FastDelivery className="text-light-green w-6 h-6" />
          </div>
          <div>
            <span className="font-semibold text-white block mb-2 text-lg">
              Fast delivery
            </span>
            <p className="max-w-sm leading-relaxed">
              Your package will arrive in 3-5 business days at your pick up
              location or in the comfort of your home.
            </p>
          </div>
        </div>
        <div className="bg-black/20 backdrop-blur-sm rounded-lg p-5 border border-white/5 flex items-start gap-x-4">
          <div className="bg-green-500/20 p-3 rounded-full">
            <Refresh className="text-green-400 w-6 h-6" />
          </div>
          <div>
            <span className="font-semibold text-white block mb-2 text-lg">
              Simple exchanges
            </span>
            <p className="max-w-sm leading-relaxed">
              Is the fit not quite right? No worries - we&apos;ll exchange your
              product for a new one.
            </p>
          </div>
        </div>
        <div className="bg-black/20 backdrop-blur-sm rounded-lg p-5 border border-white/5 flex items-start gap-x-4">
          <div className="bg-purple-500/20 p-3 rounded-full">
            <Back className="text-purple-400 w-6 h-6" />
          </div>
          <div>
            <span className="font-semibold text-white block mb-2 text-lg">
              Easy returns
            </span>
            <p className="max-w-sm leading-relaxed">
              Just return your product and we&apos;ll refund your money. No
              questions asked – we&apos;ll do our best to make sure your return
              is hassle-free.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductTabs
