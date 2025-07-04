import { Text } from "@medusajs/ui"
import React, { useState, useEffect } from "react"
import Input from "@modules/common/components/input"
import { paymentInfoMap } from "@lib/constants"
import Image from "next/image"
import GooglePayButton from "@google-pay/button-react"

export type AuthorizeNetCardInfo = {
  cardNumber: string
  cardCode: string
  expiration: string
  fullName: string
  zip?: string
}

type WalletPaymentType = "apple-pay" | "google-pay" | null

type AuthorizeNetPaymentProps = {
  cardData: AuthorizeNetCardInfo
  setPaymentData: (data: any) => void
  setWalletPaymentType: (data: any) => void
  walletPaymentType: WalletPaymentType
  setCardData: (data: any) => void
  errorMessage: string | null
  paymentMethod: any
  isAuthorizeNetFunc: (providerId?: string) => boolean | undefined
  handleSubmit: (paymentData?: any) => void
  isLoading: boolean
  buttonText?: string
  disabled?: boolean
  shippingNotSet?: boolean
  onShippingFix?: () => void
  totalPrice?: string
}

const cardPaymentMethods = [
  "/images/payment/master.png",
  "/images/payment/discover.png",
  "/images/payment/amex.png",
  "/images/payment/visa.png",
]

const AuthorizeNetPayment: React.FC<AuthorizeNetPaymentProps> = ({
  cardData,
  setCardData,
  setPaymentData,
  setWalletPaymentType,
  walletPaymentType,
  errorMessage,
  paymentMethod,
  isAuthorizeNetFunc,
  handleSubmit,
  isLoading,
  buttonText = "Complete Purchase",
  totalPrice = "1.99",
}) => {
  const [isApplePayAvailable, setIsApplePayAvailable] = useState(false)

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      window.ApplePaySession &&
      window.ApplePaySession.canMakePayments()
    ) {
      setIsApplePayAvailable(true)
    }
  }, [])
  return (
    <div className="w-full">
      <h3 className="text-lg font-medium mb-4 text-white">Payment Method</h3>

      {/* Payment Method Radio Buttons */}
      <div className="mb-6 space-y-4">
        {/* Google Pay Option */}
        <label className="flex items-center p-4 border border-gray-700 rounded-lg cursor-pointer hover:bg-gray-800 transition-colors">
          <input
            type="radio"
            name="paymentMethod"
            className="mr-3 h-5 w-5 accent-green-500"
            checked={walletPaymentType === "google-pay"}
            onChange={() => setWalletPaymentType("google-pay")}
          />
          <div className="flex items-center">
            <Image
              src="/images/payment/google-pay.svg"
              alt="Google Pay"
              width={80}
              height={40}
              className="object-contain"
            />
          </div>
        </label>

        {/* Apple Pay Option - Only show if available */}
        {isApplePayAvailable && (
          <label className="flex items-center p-4 border border-gray-700 rounded-lg cursor-pointer hover:bg-gray-800 transition-colors">
            <input
              type="radio"
              name="paymentMethod"
              className="mr-3 h-5 w-5 accent-green-500"
              checked={walletPaymentType === "apple-pay"}
              onChange={() => setWalletPaymentType("apple-pay")}
            />
            <div className="flex items-center">
              <Image
                src="/images/payment/apple-pay.svg"
                alt="Apple Pay"
                width={80}
                height={40}
                className="object-contain"
              />
            </div>
          </label>
        )}

        {/* Credit Card Option */}
        <label className="flex items-center p-4 border border-gray-700 rounded-lg cursor-pointer hover:bg-gray-800 transition-colors">
          <input
            type="radio"
            name="paymentMethod"
            className="mr-3 h-5 w-5 accent-green-500"
            checked={walletPaymentType === null}
            onChange={() => setWalletPaymentType(null)}
          />
          <div className="flex items-center">
            <div className="flex space-x-2 mr-3">
              {cardPaymentMethods.map((method, index) => (
                <Image
                  key={index}
                  width={40}
                  height={25}
                  alt={`method-${index}`}
                  src={method}
                  className="object-contain"
                />
              ))}
            </div>
            <span className="text-white">Credit Card</span>
          </div>
        </label>
      </div>

      {/* Display error message if any */}
      {errorMessage && (
        <div className="mb-6 p-4 border border-red-700 rounded-md bg-red-900/50">
          <p className="text-red-300">{errorMessage}</p>
        </div>
      )}

      <div>
        {isAuthorizeNetFunc(paymentMethod) && walletPaymentType === null && (
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
                        setCardData({
                          ...cardData,
                          cardNumber: formattedValue,
                        })
                      }}
                      maxLength={19} // 16 digits + 3 spaces
                      className="bg-gray-800 border-gray-700 text-white text-base h-12 px-4 py-3 w-full rounded-lg focus:ring-2 focus:ring-[#057E03] focus:border-transparent"
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      {paymentInfoMap[paymentMethod]?.icon}
                    </div>
                  </div>
                </div>

                {/* Cardholder Name */}
                <div className="space-y-2">
                  <Text className="text-base font-medium text-gray-300 mb-1">
                    Cardholder Name
                  </Text>
                  <Input
                    name="card-holder-name"
                    type="text"
                    label="Cardholder Name"
                    value={cardData.fullName} // This binds the input to the fullName state
                    onChange={(e) => {
                      const newFullName = e.target.value
                      setCardData({
                        ...cardData,
                        fullName: newFullName,
                      })
                    }}
                    autoComplete="off" // 🔥 or try "name" if "off" fails
                    className="bg-gray-800 border-gray-700 text-white text-base h-12 px-4 py-3 w-full rounded-lg focus:ring-2 focus:ring-[#057E03] focus:border-transparent"
                  />
                </div>

                {/* Expiry and CVV */}
                <div className="flex items-center justify-between space-x-4">
                  <div className="w-1/2 space-y-2">
                    <Text className="text-base font-medium text-gray-300 mb-1">
                      Expiration
                    </Text>
                    <Input
                      name="card-expiration"
                      type="text"
                      label="MM/YY"
                      value={cardData.expiration}
                      onChange={(e) => {
                        // Apply mask: only allow numbers and add / after 2 digits
                        const value = e.target.value.replace(/[^0-9]/g, "")
                        let formattedValue = value
                        if (value.length > 2) {
                          formattedValue =
                            value.substring(0, 2) + "/" + value.substring(2)
                        }
                        setCardData({
                          ...cardData,
                          expiration: formattedValue,
                        })
                      }}
                      maxLength={5} // MM/YY format
                      className="bg-gray-800 border-gray-700 text-white text-base h-12 px-4 py-3 w-full rounded-lg focus:ring-2 focus:ring-[#057E03] focus:border-transparent"
                    />
                  </div>
                  <div className="w-1/2 space-y-2">
                    <Text className="text-base font-medium text-gray-300 mb-1">
                      CVV
                    </Text>
                    <Input
                      name="card-cvv"
                      type="text"
                      label="123"
                      value={cardData.cardCode}
                      onChange={(e) => {
                        // Only allow numbers
                        const value = e.target.value.replace(/[^0-9]/g, "")
                        setCardData({
                          ...cardData,
                          cardCode: value,
                        })
                      }}
                      maxLength={4} // CVV is usually 3-4 digits
                      className="bg-gray-800 border-gray-700 text-white text-base h-12 px-4 py-3 w-full rounded-lg focus:ring-2 focus:ring-[#057E03] focus:border-transparent"
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
                  <div className="flex items-center text-red-400 mt-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
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

      {/* Render different buttons based on payment method selection */}
      {walletPaymentType === "google-pay" ? (
        // Google Pay Button
        <div className="mt-6">
          <GooglePayButton
            environment="PRODUCTION"
            paymentRequest={{
              apiVersion: 2,
              apiVersionMinor: 0,
              allowedPaymentMethods: [
                {
                  type: "CARD",
                  parameters: {
                    allowedAuthMethods: ["PAN_ONLY", "CRYPTOGRAM_3DS"],
                    allowedCardNetworks: [
                      "MASTERCARD",
                      "VISA",
                      "AMEX",
                      "DISCOVER",
                    ],
                  },
                  tokenizationSpecification: {
                    type: "PAYMENT_GATEWAY",
                    parameters: {
                      gateway: "authorizenet",
                      gatewayMerchantId: "2740879",
                    },
                  },
                },
              ],
              merchantInfo: {
                merchantId: "BCR2DN7T5CVNTZDB",
                merchantName: "JOHN BOY ENTERTAINMENT, INC",
              },
              transactionInfo: {
                totalPriceStatus: "FINAL",
                totalPriceLabel: "Total",
                totalPrice: totalPrice.replace("$", ""),
                currencyCode: "USD",
                countryCode: "US",
              },
            }}
            onLoadPaymentData={(paymentRequest) => {
              setPaymentData(paymentRequest)
              handleSubmit()
            }}
            buttonColor="white"
            buttonType="buy"
            buttonRadius={6}
            buttonSizeMode="fill"
            style={{ width: "100%", height: 56 }}
          />
        </div>
      ) : walletPaymentType === "apple-pay" ? (
        // Apple Pay Button
        <button
          className="mt-6 w-full h-14 bg-black text-white rounded-lg flex items-center justify-center border border-white"
          onClick={(e) => {
            e.preventDefault()
            handleSubmit()
          }}
          disabled={isLoading}
          style={{ width: "100%" }}
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <svg
                className="animate-spin h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Processing...
            </div>
          ) : (
            <div className="flex items-center justify-center w-full">
              <p className="font-bold text-2xl mr-2">Buy With</p>
              <Image
                src="/images/payment/apple-pay.svg"
                alt="Apple Pay"
                width={120}
                height={50}
                className="object-contain"
              />
            </div>
          )}
        </button>
      ) : (
        // Credit Card Button
        <button
          className="mt-6 w-full h-14 text-base px-8 rounded-full bg-[#057E03] hover:bg-[#61C65F] shadow-md text-white flex items-center justify-center transition-colors duration-200"
          onClick={(e) => {
            e.preventDefault()
            handleSubmit()
          }}
          disabled={
            isLoading ||
            (isAuthorizeNetFunc(paymentMethod) && !cardData.cardNumber)
          }
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <svg
                className="animate-spin h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Processing...
            </div>
          ) : (
            buttonText
          )}
        </button>
      )}
    </div>
  )
}

export default AuthorizeNetPayment
