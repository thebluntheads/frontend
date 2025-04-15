"use client"

import { convertToLocale } from "@lib/util/money"
import React from "react"

type CartTotalsProps = {
  totals: {
    total?: number | null
    subtotal?: number | null
    tax_total?: number | null
    shipping_total?: number | null
    discount_total?: number | null
    gift_card_total?: number | null
    currency_code: string
    shipping_subtotal?: number | null
  }
}

const CartTotals: React.FC<CartTotalsProps> = ({ totals }) => {
  const {
    currency_code,
    total,
    subtotal,
    tax_total,
    discount_total,
    gift_card_total,
    shipping_subtotal,
  } = totals

  return (
    <div className="text-white">
      <div className="flex flex-col gap-y-4 text-base">
        <div className="flex items-center justify-between">
          <span className="flex gap-x-1 items-center text-gray-300 font-medium">
            Subtotal (excl. shipping and taxes)
          </span>
          <span
            className="text-white font-medium"
            data-testid="cart-subtotal"
            data-value={subtotal || 0}
          >
            {convertToLocale({ amount: subtotal ?? 0, currency_code })}
          </span>
        </div>
        {!!discount_total && (
          <div className="flex items-center justify-between">
            <span className="text-gray-300 font-medium">Discount</span>
            <span
              className="text-light-green font-medium"
              data-testid="cart-discount"
              data-value={discount_total || 0}
            >
              -{" "}
              {convertToLocale({ amount: discount_total ?? 0, currency_code })}
            </span>
          </div>
        )}
        <div className="flex items-center justify-between">
          <span className="text-gray-300 font-medium">Shipping</span>
          <span
            className="text-white font-medium"
            data-testid="cart-shipping"
            data-value={shipping_subtotal || 0}
          >
            {convertToLocale({ amount: shipping_subtotal ?? 0, currency_code })}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="flex gap-x-1 items-center text-gray-300 font-medium">
            Taxes
          </span>
          <span
            className="text-white font-medium"
            data-testid="cart-taxes"
            data-value={tax_total || 0}
          >
            {convertToLocale({ amount: tax_total ?? 0, currency_code })}
          </span>
        </div>
        {!!gift_card_total && (
          <div className="flex items-center justify-between">
            <span className="text-gray-300 font-medium">Gift card</span>
            <span
              className="text-light-green font-medium"
              data-testid="cart-gift-card-amount"
              data-value={gift_card_total || 0}
            >
              -{" "}
              {convertToLocale({ amount: gift_card_total ?? 0, currency_code })}
            </span>
          </div>
        )}
      </div>
      <div className="h-px w-full border-b border-white/20 my-4" />
      <div className="flex items-center justify-between mb-2">
        <span className="text-white font-medium">Total</span>
        <span
          className="text-xl font-bold text-white"
          data-testid="cart-total"
          data-value={total || 0}
        >
          {convertToLocale({ amount: total ?? 0, currency_code })}
        </span>
      </div>
      <div className="h-px w-full border-b border-white/20 mt-4" />
    </div>
  )
}

export default CartTotals
