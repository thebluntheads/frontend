"use client"

import { Button } from "@medusajs/ui"

import OrderCard from "../order-card"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { HttpTypes } from "@medusajs/types"

const OrderOverview = ({ orders }: { orders: HttpTypes.StoreOrder[] }) => {
  if (orders?.length) {
    return (
      <div className="flex flex-col gap-y-6 w-full">
        {orders.map((o) => (
          <div
            key={o.id}
            className="border-b border-white/10 pb-6 last:pb-0 last:border-none"
          >
            <OrderCard order={o} />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div
      className="w-full flex flex-col items-center gap-y-6 bg-black/30 backdrop-blur-md border border-white/10 rounded-xl p-8 text-center"
      data-testid="no-orders-container"
    >
      <div className="bg-blue-500/10 p-4 rounded-full">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
      </div>
      <h2 className="text-xl font-semibold text-white">No Orders Yet</h2>
      <p className="text-white/70">
        You don&apos;t have any orders yet, let us change that {":)"}
      </p>
      <div className="mt-4">
        <LocalizedClientLink href="/" passHref>
          <Button 
            data-testid="continue-shopping-button"
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 py-2.5 px-6"
          >
            Browse Products
          </Button>
        </LocalizedClientLink>
      </div>
    </div>
  )
}

export default OrderOverview
