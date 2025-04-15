import { Button } from "@medusajs/ui"
import { useMemo } from "react"

import Thumbnail from "@modules/products/components/thumbnail"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { convertToLocale } from "@lib/util/money"
import { HttpTypes } from "@medusajs/types"

type OrderCardProps = {
  order: HttpTypes.StoreOrder
}

const OrderCard = ({ order }: OrderCardProps) => {
  const numberOfLines = useMemo(() => {
    return (
      order.items?.reduce((acc, item) => {
        return acc + item.quantity
      }, 0) ?? 0
    )
  }, [order])

  const numberOfProducts = useMemo(() => {
    return order.items?.length ?? 0
  }, [order])

  return (
    <div
      className="bg-black/30 backdrop-blur-md border border-white/10 rounded-xl p-6 flex flex-col"
      data-testid="order-card"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="bg-blue-500/10 p-2 rounded-lg">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-light-green"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
          </div>
          <div>
            <div className="text-white font-semibold text-lg">
              Order #
              <span data-testid="order-display-id">{order.display_id}</span>
            </div>
            <div
              className="text-white/60 text-sm"
              data-testid="order-created-at"
            >
              {new Date(order.created_at).toDateString()}
            </div>
          </div>
        </div>
        <div className="bg-white/10 px-3 py-1.5 rounded-lg">
          <span className="text-white font-medium" data-testid="order-amount">
            {convertToLocale({
              amount: order.total,
              currency_code: order.currency_code,
            })}
          </span>
        </div>
      </div>

      <div className="bg-black/20 border border-white/5 rounded-lg p-3 mb-4">
        <div className="text-white/70 text-sm mb-3 flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
            />
          </svg>
          {`${numberOfLines} ${numberOfLines > 1 ? "items" : "item"}`}
        </div>

        <div className="grid grid-cols-2 small:grid-cols-4 gap-4">
          {order.items?.slice(0, 3).map((i) => {
            return (
              <div
                key={i.id}
                className="flex flex-col gap-y-2"
                data-testid="order-item"
              >
                <div className="bg-black/30 rounded-lg overflow-hidden">
                  <Thumbnail thumbnail={i.thumbnail} images={[]} size="full" />
                </div>
                <div className="flex items-center text-sm text-white/80">
                  <span
                    className="text-white font-medium truncate"
                    data-testid="item-title"
                  >
                    {i.title}
                  </span>
                  <span className="ml-2 text-white/60">x</span>
                  <span className="text-white/60" data-testid="item-quantity">
                    {i.quantity}
                  </span>
                </div>
              </div>
            )
          })}
          {numberOfProducts > 4 && (
            <div className="w-full h-full flex flex-col items-center justify-center bg-white/5 rounded-lg p-4">
              <span className="text-white/70">+ {numberOfLines - 4}</span>
              <span className="text-white/70">more</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end">
        <LocalizedClientLink href={`/account/orders/details/${order.id}`}>
          <Button
            data-testid="order-details-link"
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 py-2 px-4 text-sm"
          >
            View Order Details
          </Button>
        </LocalizedClientLink>
      </div>
    </div>
  )
}

export default OrderCard
