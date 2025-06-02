"use client"

import {
  isAuthorizeNet as isAuthorizeNetFunc,
  paymentInfoMap,
} from "@lib/constants"
import { initiatePaymentSession, placeOrder } from "@lib/data/cart"
import { Button, Container, Heading, Text, clx } from "@medusajs/ui"
import Image from "next/image"
import {
  redirect,
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation"
import { useAcceptJs } from "react-acceptjs"
import { useCallback, useEffect, useState } from "react"
import PaymentIcon from "@modules/common/icons/paymentIcon"
import { CheckCircleSolid, CreditCard } from "@medusajs/icons"
import { AuthorizeNetContainer } from "../payment-container/authorize-net-container"
import { placeDigitalProductOrder } from "@lib/data/digital-cart"
import GooglePayButton from "@google-pay/button-react"

const cardPaymentMethods = [
  "/images/payment/master.png",
  "/images/payment/discover.png",
  "/images/payment/amex.png",
  "/images/payment/visa.png",
]

const authData = {
  apiLoginID: process.env.NEXT_PUBLIC_AUTHORIZE_NET_LOGIN_ID || "",
  clientKey: process.env.NEXT_PUBLIC_AUTHORIZE_NET_CLIENT_KEY || "",
}

type BasicCardInfo = {
  cardNumber: string
  cardCode: string
  expiration: string
  zip?: string
  fullName: string
}

type WalletPaymentType = "apple-pay" | "google-pay" | null

const Payment = ({
  cart,
  availablePaymentMethods,
}: {
  cart: any
  availablePaymentMethods: any[]
}) => {
  const activeSession = cart.payment_collection?.payment_sessions?.find(
    (paymentSession: any) => paymentSession.status === "pending"
  )
  const isDigital = cart?.items?.some(
    //@ts-ignore
    (i) => i?.product_type_id === "ptyp_01JRX8NFV7EZVBXKBJ9ZHSEJ0W"
  )

  const [isLoading, setIsLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [paymentData, setPaymentData] =
    useState<google.payments.api.PaymentData>()

  const [error, setError] = useState<string | null>(null)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(
    activeSession?.provider_id ?? "pp_authorize-net_authorize-net"
  )

  const [cardData, setCardData] = useState<BasicCardInfo>({
    cardNumber: "",
    expiration: "",
    cardCode: "",
    fullName: "",
  })

  const [walletPaymentType, setWalletPaymentType] =
    useState<WalletPaymentType>(null)

  const [isApplePayAvailable, setIsApplePayAvailable] = useState(false)

  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  // Make payment visible when shipping is completed or when step is payment
  const isOpen =
    searchParams.get("step") === "payment" ||
    (cart?.shipping_methods && cart?.shipping_methods.length > 0)

  const isAuthorizeNet = isAuthorizeNetFunc(activeSession?.provider_id)

  const {
    dispatchData,
    loading,
    error: err,
  } = useAcceptJs({ environment: "PRODUCTION", authData })

  const [month, year] = cardData.expiration.split("/")

  const paymentReady = activeSession && cart?.shipping_methods.length !== 0

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams)
      params.set(name, value)

      return params.toString()
    },
    [searchParams]
  )

  const onPaymentCompleted = async () => {
    if (!isDigital) {
      await placeOrder()
        .catch((err) => {
          setErrorMessage(err.message)
        })
        .finally(() => {
          setSubmitting(false)
        })
    } else {
      await placeDigitalProductOrder()
        .catch((err) => {
          setErrorMessage(err.message)
        })
        .finally(() => {
          setSubmitting(false)
        })
    }
  }

  // Handle Apple Pay payment process
  const handleApplePay = async () => {
    try {
      // Check if Apple Pay is available
      if (
        !window.ApplePaySession ||
        !window.ApplePaySession.canMakePayments()
      ) {
        throw new Error("Apple Pay is not available on this device or browser")
      }

      // Configure the payment request
      const paymentRequest = {
        countryCode: "US",
        currencyCode: "USD",
        supportedNetworks: ["visa", "masterCard", "amex", "discover"],
        merchantCapabilities: [
          "supports3DS",
          "supportsCredit",
          "supportsDebit",
        ],
        requiredBillingContactFields: ["postalAddress", "email", "phone"],
        total: {
          label: "The Blunt Heads",
          amount: cart.total.toFixed(2),
        },
      }

      // Create an Apple Pay session
      const session = new window.ApplePaySession(3, paymentRequest)
      // Handle payment authorization
      return new Promise<{ token: string; billing_address: any }>(
        (resolve, reject) => {
          session.onvalidatemerchant = async (event: any) => {
            try {
              // Call your backend to validate the merchant with Apple's validation URL
              const response = await fetch("/api/apple-pay/validate-merchant", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  validationURL: event.validationURL,
                }),
              })

              if (!response.ok) {
                const errorText = await response.text()
                throw new Error(`Merchant validation failed: ${errorText}`)
              }

              const merchantSession = await response.json()

              // Complete merchant validation with the session from Apple
              session.completeMerchantValidation(merchantSession)
            } catch (error) {
              console.error("Merchant validation failed:", error)
              session.abort()
              reject(error as Error)
            }
          }

          session.onpaymentauthorized = async (event: any) => {
            try {
              // Get the payment data from the event
              const token = event.payment.token.paymentData
              const base64 = window.btoa(JSON.stringify(token))
              const billingContact = event.payment.billingContact

              // Complete the payment
              session.completePayment(window.ApplePaySession.STATUS_SUCCESS)

              const billing_address = billingContact
                ? billingContact
                : cart?.billing_address

              // Return the token for processing with Authorize.Net
              resolve({
                token: base64,
                billing_address: billing_address,
              })
            } catch (error) {
              console.error("Payment authorization failed:", error)
              session.completePayment(window.ApplePaySession.STATUS_FAILURE)
              reject(error as Error)
            }
          }

          session.oncancel = () => {
            reject(new Error("Apple Pay payment was canceled"))
          }

          // Start the session
          session.begin()
        }
      )
    } catch (error) {
      console.error("Apple Pay error:", error)
      throw error
    }
  }

  const handleGooglePay = async () => {
    try {
      const tokenData = paymentData?.paymentMethodData.tokenizationData.token!
      const base64 = window.btoa(tokenData)
      const billingAddress =
        paymentData?.paymentMethodData?.info?.billingAddress

      const billing_address = billingAddress
        ? billingAddress
        : cart?.billing_address

      return {
        token: base64,
        billing_address: billing_address,
      }
    } catch (error) {
      console.error("Google Pay error:", error)
      throw error
    }
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    setErrorMessage(null)

    try {
      const shouldInputCard =
        isAuthorizeNetFunc(selectedPaymentMethod) && !activeSession

      if (walletPaymentType) {
        let walletPaymentData

        if (walletPaymentType === "apple-pay") {
          walletPaymentData = await handleApplePay()

          const payc = await initiatePaymentSession(cart, {
            provider_id: selectedPaymentMethod,
            data: {
              billing_address: walletPaymentData.billing_address,
              customer: cart.customer,
              applePayData: walletPaymentData.token,
            },
          })

          const pendingSession =
            payc?.payment_collection?.payment_sessions?.find(
              (session: any) => session.status === "pending"
            )

          if (pendingSession) {
            setSubmitting(true)
            await onPaymentCompleted()
            return
          }
        } else if (walletPaymentType === "google-pay") {
          walletPaymentData = await handleGooglePay()

          const payc = await initiatePaymentSession(cart, {
            provider_id: selectedPaymentMethod,
            data: {
              billing_address: walletPaymentData.billing_address,
              customer: cart.customer,
              googlePayData: walletPaymentData?.token!,
            },
          })

          const pendingSession =
            payc?.payment_collection?.payment_sessions?.find(
              (session: any) => session.status === "pending"
            )

          if (pendingSession) {
            setSubmitting(true)
            await onPaymentCompleted()
            return
          }
        }

        // Handle unexpected session state
        setErrorMessage(
          "Digital wallet payment session initiation failed. Please try again."
        )
        return
      }

      if (cardData.cardNumber) {
        // Step 1: Send card data to Authorize.Net
        const transactionResponse = await dispatchData({
          cardData: {
            cardNumber: cardData.cardNumber.replace(/\s+/g, ""),
            month,
            year,
            cardCode: cardData.cardCode,
            fullName: cardData.fullName, // Include full name in the dispatch
          },
        })

        // Handle transaction errors
        if (transactionResponse?.messages?.resultCode === "Error") {
          const errorText =
            transactionResponse.messages.message[0]?.text || "Payment failed"
          setErrorMessage(errorText)
          return
        }

        // Step 2: Initiate payment session with opaque data
        if (transactionResponse?.messages?.resultCode === "Ok") {
          const opaqueData = transactionResponse.opaqueData.dataValue
          const payc = await initiatePaymentSession(cart, {
            provider_id: selectedPaymentMethod,
            data: {
              billing_address: cart.billing_address,
              customer: cart.customer,
              opaqueData,
              fullName: cardData.fullName, // Include full name in payment session data
            },
          })

          // Handle successful payment initiation
          const pendingSession =
            payc?.payment_collection?.payment_sessions?.find(
              (session: any) => session.status === "pending"
            )

          if (pendingSession) {
            setSubmitting(true)
            await onPaymentCompleted()
            return
          }

          // Handle unexpected session state
          setErrorMessage(
            "Payment session initiation failed. Please try again."
          )
        }
      }

      const checkActiveSession =
        activeSession?.provider_id === selectedPaymentMethod

      if (!checkActiveSession) {
        await initiatePaymentSession(cart, {
          provider_id: selectedPaymentMethod,
        })
      }

      if (!shouldInputCard) {
        return router.push(
          pathname + "?" + createQueryString("step", "review"),
          {
            scroll: false,
          }
        )
      }
    } catch (err: any) {
      console.log(err)
      const msg = err?.messages?.message?.[0]?.text || err.message
      setErrorMessage(msg)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    setError(null)

    if (cart?.billing_address) {
      setCardData((prevData) => ({
        ...prevData,
        fullName: cart.billing_address.first_name
          ? `${cart.billing_address.first_name} ${
              cart.billing_address.last_name || ""
            }`.trim()
          : prevData.fullName,
      }))
    }
  }, [isOpen, cart])

  useEffect(() => {
    if (window.ApplePaySession && window.ApplePaySession.canMakePayments()) {
      setIsApplePayAvailable(true)
    }
  }, [])

  return (
    <>
      <div className="bg-gray-900 text-white">
        <div
          className={`flex flex-row items-center justify-between bg-gray-800 py-4 px-5 border border-gray-700 ${
            (cart.shipping_methods?.length ?? 0) > 0
              ? "cursor-pointer"
              : "cursor-not-allowed"
          } rounded-b-2xl`}
        >
          <div className="flex items-center gap-2">
            <PaymentIcon size={20} />
            <Heading
              level="h2"
              className={clx(
                "flex flex-row text-lg font-medium gap-x-2 items-baseline text-white",
                {
                  "pointer-events-none select-none": !isOpen && !paymentReady,
                }
              )}
            >
              Payment
              {!isOpen && paymentReady && (
                <CheckCircleSolid className="text-green-400" />
              )}
            </Heading>
            {paymentReady && <CheckCircleSolid className="text-green-400" />}
          </div>
          <div>
            {paymentReady && (
              <div className="flex justify-end">
                <p
                  onClick={() => redirect("/checkout?step=payment")}
                  className="w-fit text-light-green transition-all duration-200 rounded z-40 px-2 py-1 cursor-pointer hover:text-white hover:bg-dark-green"
                >
                  Edit
                </p>
              </div>
            )}
          </div>
        </div>
        {isOpen ? (
          <div className="px-5 py-6 border-x border-b rounded-b-2xl border-gray-700 bg-gray-900">
            <div>
              {availablePaymentMethods?.length && (
                <>
                  {/* Payment Method Radio Buttons */}
                  <div className="mb-6 space-y-4">
                    {/* Google Pay Option */}
                    <label className="flex items-center p-4 border border-gray-700 rounded-lg cursor-pointer hover:bg-white-800 transition-colors bg-white">
                      <input
                        type="radio"
                        name="paymentMethod"
                        className="mr-3 h-5 w-5 accent-green-500"
                        checked={walletPaymentType === "google-pay"}
                        onChange={() => setWalletPaymentType("google-pay")}
                      />
                      <div className="flex items-center">
                        <Image
                          src="/images/payment/GPay_Acceptance_Mark_800.png"
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

                  {isAuthorizeNetFunc(selectedPaymentMethod) &&
                  walletPaymentType === null ? (
                    <>
                      <AuthorizeNetContainer
                        paymentProviderId={selectedPaymentMethod}
                        setCardData={setCardData}
                        cardData={cardData}
                        errorMessage={errorMessage}
                      />
                    </>
                  ) : null}

                  {errorMessage && (
                    <div className="mb-6 p-4 border border-red-700 rounded-md bg-red-900/50">
                      <p className="text-red-300">{errorMessage}</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-start gap-y-4 w-full rounded-b-2xl py-6 border-x border-b border-gray-700 px-5 flex-wrap bg-gray-900">
            <div className="flex flex-col w-full small:w-1/3 px-2">
              <Text className="text-base font-semibold text-white mb-1">
                Payment method
              </Text>
              <Text
                className="text-gray-300"
                data-testid="payment-method-summary"
              >
                {paymentInfoMap[activeSession?.provider_id]?.title ||
                  activeSession?.provider_id}
              </Text>
            </div>
            <div className="flex flex-col w-full small:w-1/3 px-2">
              <Text className="text-base font-semibold text-white mb-1">
                Payment details
              </Text>
              <div
                className="flex gap-2 text-gray-300 items-center"
                data-testid="payment-details-summary"
              >
                <Container className="flex items-center h-7 w-fit p-2 bg-gray-800 border border-gray-700">
                  <CreditCard className="text-white" />
                </Container>
                <Text className="text-gray-300">Credit Card</Text>
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="mt-10 flex items-center justify-end gap-4">
        {walletPaymentType === "google-pay" ? (
          // Google Pay Button
          <div className="w-full">
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
                  totalPrice: cart.total.toFixed(2),
                  currencyCode: "USD",
                  countryCode: "US",
                },
              }}
              onLoadPaymentData={async (paymentRequest) => {
                setPaymentData(paymentRequest)
                await handleSubmit()
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
                <p className="font-bold text-2xl">Buy With</p>
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
          <Button
            size="large"
            className="h-14 text-base px-8 rounded-full bg-dark-green hover:bg-dark-green shadow-md text-white"
            onClick={handleSubmit}
            isLoading={isLoading}
            disabled={
              (isAuthorizeNet && !cardData.cardNumber) || !selectedPaymentMethod
            }
            data-testid="submit-payment-button"
          >
            Place Order
          </Button>
        )}
      </div>
    </>
  )
}

export default Payment
