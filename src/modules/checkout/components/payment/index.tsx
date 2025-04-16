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

const paymentMethods = [
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

  console.log({ cart })

  const isDigital = cart?.items?.some(
    //@ts-ignore
    (i) => i?.product_type_id === "ptyp_01JRX8NFV7EZVBXKBJ9ZHSEJ0W"
  )

  const [isLoading, setIsLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

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
  console.log({ err })
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

  const handleSubmit = async () => {
    setIsLoading(true)
    setErrorMessage(null)

    try {
      console.log(cardData)
      const shouldInputCard =
        isAuthorizeNetFunc(selectedPaymentMethod) && !activeSession
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
        console.log({ transactionResponse })
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
          console.log(JSON.stringify(payc))
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

    // Load shipping address data when component mounts or when cart changes
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
                  <div className="flex items-center gap-2 mb-6 flex-wrap">
                    {paymentMethods.map((method, index) => (
                      <Image
                        key={index}
                        width={60}
                        height={40}
                        alt={`method-${index}`}
                        src={method}
                      />
                    ))}
                  </div>

                  {isAuthorizeNetFunc(selectedPaymentMethod) ? (
                    <AuthorizeNetContainer
                      paymentProviderId={selectedPaymentMethod}
                      setCardData={setCardData}
                      cardData={cardData}
                      errorMessage={errorMessage}
                    />
                  ) : null}
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
      <div className=" mt-10 flex items-center justify-end gap-4">
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
      </div>
    </>
  )
}

export default Payment
