import { convertToLocale } from "@lib/util/money"
import { HttpTypes } from "@medusajs/types"
import { Heading, Text } from "@medusajs/ui"

import Divider from "@modules/common/components/divider"

type ShippingDetailsProps = {
  order: HttpTypes.StoreOrder
}

const ShippingDetails = ({ order }: ShippingDetailsProps) => {
  return (
    <div className="text-white">
      <div className="space-y-6">
        {/* Shipping Address Section */}
        <div data-testid="shipping-address-summary">
          <div className="flex items-center mb-3 border-b border-gray-700 pb-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-dark-green mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <span className="text-white font-medium text-lg">
              Shipping Address
            </span>
          </div>
          <div className="ml-7 space-y-1">
            <p className="text-white">
              {order.shipping_address?.first_name}{" "}
              {order.shipping_address?.last_name}
            </p>
            <p className="text-gray-300">
              {order.shipping_address?.address_1}{" "}
              {order.shipping_address?.address_2}
            </p>
            <p className="text-gray-300">
              {order.shipping_address?.postal_code}
              {order.shipping_address?.postal_code ?? ","}
              {order.shipping_address?.city}
            </p>
            <p className="text-gray-300">
              {order.shipping_address?.country_code?.toUpperCase()}
            </p>
          </div>
        </div>

        {/* Contact Section */}
        <div data-testid="shipping-contact-summary">
          <div className="flex items-center mb-3 border-b border-gray-700 pb-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-dark-green mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
              />
            </svg>
            <span className="text-white font-medium text-lg">Contact</span>
          </div>
          <div className="ml-7 space-y-1">
            <p className="text-white">
              {order.shipping_address?.phone || "No phone provided"}
            </p>
            <p className="text-gray-300">{order.email}</p>
          </div>
        </div>

        {/* Shipping Method Section */}
        <div data-testid="shipping-method-summary">
          <div className="flex items-center mb-3 border-b border-gray-700 pb-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-dark-green mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
              />
            </svg>
            <span className="text-white font-medium text-lg">
              Shipping Method
            </span>
          </div>
          <div className="ml-7 space-y-1">
            <p className="text-white">
              {(order as any).shipping_methods[0]?.name || "Standard Shipping"}
            </p>
            <p className="text-gray-300">
              {convertToLocale({
                amount: order.shipping_methods?.[0].total ?? 0,
                currency_code: order.currency_code,
              })
                .replace(/,/g, "")
                .replace(/\./g, ",")}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ShippingDetails
