import { convertToLocale } from "@lib/util/money"
import { HttpTypes } from "@medusajs/types"

type OrderSummaryProps = {
  order: HttpTypes.StoreOrder
}

const OrderSummary = ({ order }: OrderSummaryProps) => {
  const getAmount = (amount?: number | null) => {
    if (!amount) {
      return
    }

    return convertToLocale({
      amount,
      currency_code: order.currency_code,
    })
  }

  return (
    <div className="text-white">
      <h2 className="text-xl font-semibold text-white mb-4 border-b border-gray-700 pb-2">
        Order Summary
      </h2>
      <div className="text-base my-4">
        <div className="flex items-center justify-between mb-4">
          <span className="text-gray-300 font-medium">Subtotal</span>
          <span className="text-white font-medium">
            {getAmount(order.subtotal)}
          </span>
        </div>
        <div className="flex flex-col gap-y-3">
          {order.discount_total > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-gray-300 font-medium">Discount</span>
              <span className="text-light-green font-medium">
                - {getAmount(order.discount_total)}
              </span>
            </div>
          )}
          {order.gift_card_total > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-gray-300 font-medium">Gift Card</span>
              <span className="text-light-green font-medium">
                - {getAmount(order.gift_card_total)}
              </span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="text-gray-300 font-medium">Shipping</span>
            <span className="text-white font-medium">
              {getAmount(order.shipping_total)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-300 font-medium">Taxes</span>
            <span className="text-white font-medium">
              {getAmount(order.tax_total)}
            </span>
          </div>
        </div>
        <div className="h-px w-full border-b border-gray-700 my-4" />
        <div className="flex items-center justify-between text-lg font-semibold mb-2">
          <span className="text-white">Total</span>
          <span className="text-white">{getAmount(order.total)}</span>
        </div>
      </div>
    </div>
  )
}

export default OrderSummary
