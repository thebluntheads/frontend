import { Text } from "@medusajs/ui"
import React from "react"
import Input from "@modules/common/components/input"
import { isAuthorizeNet as isAuthorizeNetFunc } from "@lib/constants"

type AuthorizeNetContainerProps = {
  paymentProviderId: string
  setCardData: (data: any) => void
  cardData: {
    cardNumber: string
    expiration: string
    cardCode: string
    fullName: string
  }
  errorMessage: string | null
}

export const AuthorizeNetContainer: React.FC<AuthorizeNetContainerProps> = ({
  paymentProviderId,
  setCardData,
  cardData,
  errorMessage,
}) => {
  return (
    <div>
      {isAuthorizeNetFunc(paymentProviderId) && (
        <div className="mt-6 mb-4 transition-all duration-150 ease-in-out">
          <div className="p-6 bg-gray-900 border border-gray-700 rounded-xl shadow-lg">
            <div className="space-y-6">
              {/* Card Number Row */}
              <div className="space-y-2">
                <Text className="text-base font-medium text-gray-300 mb-1">
                  Card Number
                </Text>
                <div className="relative">
                  <Input
                    name="card-number"
                    type="text"
                    label="1234 5678 9012 3456"
                    value={cardData.cardNumber}
                    onChange={(e) => {
                      // Apply mask: only allow numbers and add space every 4 digits
                      const value = e.target.value.replace(/[^0-9]/g, "")
                      const formattedValue = value
                        .replace(/\s/g, "")
                        .replace(/(.{4})/g, "$1 ")
                        .trim()
                      setCardData({ ...cardData, cardNumber: formattedValue })
                    }}
                    maxLength={19} // 16 digits + 3 spaces
                    className="bg-gray-800 border-gray-700 text-white text-base h-12 px-4 py-3 w-full rounded-lg focus:ring-2 focus:ring-dark-green focus:border-transparent"
                  />
                </div>
              </div>

              {/* Cardholder Name */}
              <div className="space-y-2">
                <Text className="text-base font-medium text-gray-300 mb-1">
                  Cardholder Name
                </Text>
                <Input
                  name="card"
                  type="text"
                  label="John Doe"
                  onChange={(e) =>
                    setCardData({ ...cardData, fullName: e.target.value })
                  }
                  className="bg-gray-800 border-gray-700 text-white text-base h-12 px-4 py-3 w-full rounded-lg focus:ring-2 focus:ring-dark-green focus:border-transparent"
                />
              </div>

              {/* Expiry and CVV */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Text className="text-base font-medium text-gray-300 mb-1">
                    Expiry Date
                  </Text>
                  <Input
                    name="expiration"
                    type="text"
                    label="MM/YY"
                    value={cardData.expiration}
                    onChange={(e) => {
                      // Apply mask: MM/YY format
                      const value = e.target.value.replace(/[^0-9]/g, "")
                      let formattedValue = value

                      // Format as MM/YY
                      if (value.length > 2) {
                        formattedValue =
                          value.slice(0, 2) + "/" + value.slice(2)
                      }

                      setCardData({
                        ...cardData,
                        expiration: formattedValue,
                      })
                    }}
                    maxLength={5} // MM/YY format (5 characters)
                    className="bg-gray-800 border-gray-700 text-white text-base h-12 px-4 py-3 w-full rounded-lg focus:ring-2 focus:ring-dark-green focus:border-transparent"
                  />
                </div>
                <div className="space-y-2">
                  <Text className="text-base font-medium text-gray-300 mb-1">
                    Security Code (CVV)
                  </Text>
                  <Input
                    name="cvv"
                    type="text"
                    label="123"
                    value={cardData.cardCode}
                    onChange={(e) =>
                      setCardData({ ...cardData, cardCode: e.target.value })
                    }
                    className="bg-gray-800 border-gray-700 text-white text-base h-12 px-4 py-3 w-full rounded-lg focus:ring-2 focus:ring-dark-green focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Security Note */}
            <div className="mt-6 flex items-center gap-2 text-gray-400 text-sm">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <span>Your payment information is secure and encrypted</span>
            </div>

            {errorMessage && (
              <div className="mt-4 p-3 bg-red-900/50 border border-red-700 rounded-lg text-red-300 text-sm font-medium">
                <div className="flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" x2="12" y1="8" y2="12" />
                    <line x1="12" x2="12.01" y1="16" y2="16" />
                  </svg>
                  {errorMessage}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default AuthorizeNetContainer
