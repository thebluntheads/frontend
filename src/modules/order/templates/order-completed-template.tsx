import { Heading } from "@medusajs/ui"
import { cookies as nextCookies } from "next/headers"

import CartTotals from "@modules/common/components/cart-totals"
import Help from "@modules/order/components/help"
import Items from "@modules/order/components/items"
import OnboardingCta from "@modules/order/components/onboarding-cta"
import OrderDetails from "@modules/order/components/order-details"
import ShippingDetails from "@modules/order/components/shipping-details"
import PaymentDetails from "@modules/order/components/payment-details"
import { HttpTypes } from "@medusajs/types"
import Image from "next/image"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

type OrderCompletedTemplateProps = {
  order: HttpTypes.StoreOrder
}

export default async function OrderCompletedTemplate({
  order,
}: OrderCompletedTemplateProps) {
  const cookies = await nextCookies()

  const isOnboarding = cookies.get("_medusa_onboarding")?.value === "true"

  return (
    <div className="py-12 min-h-[calc(100vh-64px)] bg-black">
      <div className="content-container flex flex-col justify-center items-center gap-y-10 max-w-4xl h-full w-full">
        {isOnboarding && <OnboardingCta orderId={order.id} />}
        <div
          className="flex flex-col gap-6 max-w-4xl h-full w-full py-10 px-6 bg-gray-900 rounded-xl border border-gray-800 shadow-lg"
          data-testid="order-complete-container"
        >
          {/* Success Icon */}
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 bg-dark-green rounded-full flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-10 w-10 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>

          <Heading
            level="h1"
            className="flex flex-col gap-y-3 text-white text-center text-3xl mb-4"
          >
            <span className="text-4xl font-bold">Thank you!</span>
            <span className="text-gray-300">
              Your order was placed successfully.
            </span>
          </Heading>

          {/* Order ID Banner */}
          <div className="bg-gray-800 p-4 rounded-lg mb-6 border border-gray-700">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="flex items-center mb-3 md:mb-0">
                <span className="text-gray-400 mr-2">Order ID:</span>
                <span className="text-white font-mono">{order.id}</span>
              </div>
              <div className="flex items-center">
                <span className="text-gray-400 mr-2">Date:</span>
                <span className="text-white">
                  {new Date(order.created_at).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 p-6 rounded-lg mb-6">
            <OrderDetails order={order} />
          </div>

          <Heading
            level="h2"
            className="text-white text-2xl font-bold mb-2 mt-4"
          >
            Order Summary
          </Heading>

          <div className="bg-gray-800 p-6 rounded-lg mb-6">
            <Items order={order} />
            <div className="mt-6 pt-6 border-t border-gray-700">
              <CartTotals totals={order} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-800 p-6 rounded-lg">
              <h3 className="text-white text-xl font-bold mb-4">
                Shipping Details
              </h3>
              <ShippingDetails order={order} />
            </div>

            <div className="bg-gray-800 p-6 rounded-lg">
              <h3 className="text-white text-xl font-bold mb-4">
                Payment Details
              </h3>
              <PaymentDetails order={order} />
            </div>
          </div>

          <div className="mt-8 flex flex-col md:flex-row gap-4 justify-center">
            <LocalizedClientLink
              href="/account/orders"
              className="bg-gray-800 hover:bg-gray-700 text-white py-3 px-6 rounded-lg font-medium text-center transition-colors"
            >
              View All Orders
            </LocalizedClientLink>

            <LocalizedClientLink
              href="/"
              className="bg-dark-green hover:bg-dark-green text-white py-3 px-6 rounded-lg font-medium text-center transition-colors"
            >
              Continue Shopping
            </LocalizedClientLink>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-700">
            <Help />
          </div>
        </div>
      </div>
    </div>
  )
}
