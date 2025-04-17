"use client"
import { isAuthorizeNet as isAuthorizeNetFunc } from "@lib/constants"
import AuthorizeNetPayment, {
  AuthorizeNetCardInfo,
} from "@modules/common/components/authorize-net-payment"
import React, { useEffect, useMemo, useState } from "react"
import { Dialog } from "@headlessui/react"
import { XMark } from "@medusajs/icons"
import {
  placeDigitalProductOrder,
  setStreamShippingMethod,
  updateStreamCart,
} from "@lib/data/digital-cart"
import { StoreCart, StoreCartShippingOption } from "@medusajs/types"
import { useCustomer } from "@lib/hooks/use-customer"
import { useAcceptJs } from "react-acceptjs"
import { initiatePaymentSession, retrieveCart } from "@lib/data/cart"

const authData = {
  apiLoginID: process.env.NEXT_PUBLIC_AUTHORIZE_NET_LOGIN_ID || "",
  clientKey: process.env.NEXT_PUBLIC_AUTHORIZE_NET_CLIENT_KEY || "",
}

const EpisodePaymentPopup = ({
  cart,
  availablePaymentMethods,
  availableShippingMethods,
  isOpen,
  onClose,
}: {
  cart: StoreCart
  availablePaymentMethods: any[]
  availableShippingMethods: StoreCartShippingOption[]
  isOpen: boolean
  onClose: () => void
}) => {
  const activeSession = cart?.payment_collection?.payment_sessions?.find(
    (paymentSession: any) => paymentSession.status === "pending"
  )

  const [isLoading, setIsLoading] = useState(false)
  const [error, setErrorMessage] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(
    activeSession?.provider_id ?? "pp_authorize-net_authorize-net"
  )
  const [newCart, setNewCart] = useState<StoreCart | null>(null)

  const [cardData, setCardData] = useState<AuthorizeNetCardInfo>({
    cardNumber: "",
    expiration: "",
    cardCode: "",
    fullName: "",
  })

  const { dispatchData, loading, error: err } = useAcceptJs({ authData })
  const [month, year] = cardData.expiration.split("/")

  const { customer, isLoading: isLoadingCustomer } = useCustomer()

  const [formData, setFormData] = useState<Record<string, any>>({
    "shipping_address.first_name": "",
    "shipping_address.last_name": "",
    "shipping_address.address_1": "Default Address",
    "shipping_address.postal_code": "00000",
    "shipping_address.city": "Default City",
    "shipping_address.country_code": "us",
    "shipping_address.province": "",
    "shipping_address.phone": "",
    email: customer?.email || "",
  })

  const shippingMethod = availableShippingMethods?.filter(
    (sm) => sm.amount === 0
  )[0]

  useEffect(() => {
    if (customer && isOpen) {
      setFormData((prev) => ({
        ...prev,
        email: customer.email || "",
        "shipping_address.first_name": customer.first_name || "",
        "shipping_address.last_name": customer.last_name || "",
        "shipping_address.country_code":
          customer.billing_address?.country_code || "us",
      }))
    }
  }, [customer, isOpen])

  useEffect(() => {
    const setupCart = async () => {
      if (!cart?.id || !isOpen) return
      try {
        setIsLoading(true)

        // 1. Set address only if it's not already set
        if (!cart.shipping_address) {
          const defaultAddress = {
            first_name: customer?.first_name || "",
            last_name: customer?.last_name || "",
            address_1: "Default Address",
            city: "Default City",
            country_code: customer?.billing_address?.country_code || "us",
            postal_code: "00000",
            province: "",
            phone: "",
          }

          await updateStreamCart({
            shipping_address: defaultAddress,
            billing_address: defaultAddress,
            email: customer?.email || "",
          })
        }

        // 2. Set shipping method if not already set
        if (shippingMethod?.id) {
          await setStreamShippingMethod({
            cartId: cart.id,
            shippingMethodId: shippingMethod.id,
          })
          const updatedCart = await retrieveCart(cart.id)
          setNewCart(updatedCart)
        }
      } catch (err: any) {
        setErrorMessage(err.message)
        setNewCart(cart)
      } finally {
        setIsLoading(false)
        setNewCart(cart)
      }
    }

    setupCart()
  }, [cart?.id, isOpen, customer, shippingMethod])

  const handlePaymentComplete = async () => {
    setIsLoading(true)
    setErrorMessage(null)

    if (newCart?.shipping_methods?.length === 0) {
      await assignShippingMethod()
    }

    try {
      const shouldInputCard =
        isAuthorizeNetFunc(selectedPaymentMethod) && !activeSession

      if (cardData.cardNumber && shouldInputCard) {
        const transactionResponse = await dispatchData({
          cardData: {
            cardNumber: cardData.cardNumber.replace(/\s+/g, ""),
            month,
            year,
            cardCode: cardData.cardCode,
            fullName: cardData.fullName,
          },
        })

        if (transactionResponse?.messages?.resultCode === "Error") {
          const errorText =
            transactionResponse.messages.message[0]?.text || "Payment failed"
          setErrorMessage(errorText)
          return
        }

        const opaqueData = transactionResponse.opaqueData.dataValue
        const payc = await initiatePaymentSession(cart!, {
          provider_id: selectedPaymentMethod,
          data: {
            billing_address: cart?.billing_address,
            opaqueData,
            fullName: cardData.fullName,
          },
        })

        const pendingSession = payc?.payment_collection?.payment_sessions?.find(
          (session: any) => session.status === "pending"
        )

        if (pendingSession) {
          setSubmitting(true)
          await placeDigitalProductOrder()
          return
        }

        setErrorMessage("Payment session initiation failed. Please try again.")
      }

      const checkActiveSession =
        activeSession?.provider_id === selectedPaymentMethod

      if (!checkActiveSession) {
        await initiatePaymentSession(cart!, {
          provider_id: selectedPaymentMethod,
        })
      }
    } catch (err: any) {
      const msg = err?.messages?.message?.[0]?.text || err.message
      setErrorMessage(msg)
    } finally {
      setIsLoading(false)
    }
  }

  const assignShippingMethod = async () => {
    if (!newCart?.shipping_methods?.length && shippingMethod?.id) {
      await setStreamShippingMethod({
        cartId: cart.id,
        shippingMethodId: shippingMethod.id,
      })

      const updatedCart = await retrieveCart(cart.id)
      setNewCart(updatedCart)
    }
  }

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm"
        aria-hidden="true"
      />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-2xl rounded-xl bg-black border border-gray-800 p-8 w-full max-h-[90vh] overflow-y-auto shadow-xl">
          <div className="flex justify-between items-center mb-6">
            <Dialog.Title className="text-2xl font-medium text-white">
              Complete Your Purchase
            </Dialog.Title>
            <button
              onClick={onClose}
              className="p-1 rounded-full hover:bg-gray-800 text-white"
            >
              <XMark />
            </button>
          </div>

          <div className="bg-black text-white">
            {/* Purchase Summary */}
            <div className="mb-8 border-b border-gray-800 pb-6">
              <h3 className="text-lg font-medium mb-4 text-white">
                Purchase Summary
              </h3>
              <div className="bg-gray-900 p-4 rounded-lg border border-gray-800">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-400">Item</span>
                  <span className="font-medium">
                    {cart?.items?.[0]?.title || "Episode"}
                  </span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-400">Price</span>
                  <span className="font-medium">
                    {cart?.region?.currency_code?.toUpperCase()}{" "}
                    {cart?.subtotal || 0}
                  </span>
                </div>
                {cart?.discount_total > 0 && (
                  <div className="flex justify-between mb-2 text-green-600">
                    <span>Discount</span>
                    <span>
                      - {cart?.region?.currency_code?.toUpperCase()}{" "}
                      {cart?.discount_total}
                    </span>
                  </div>
                )}
                <div className="flex justify-between mt-4 pt-4 border-t border-gray-700">
                  <span className="font-medium">Total</span>
                  <span className="font-bold">
                    {cart?.region?.currency_code?.toUpperCase()}{" "}
                    {cart?.total || 0}
                  </span>
                </div>
              </div>
            </div>

            {/* Customer Information Display */}
            <div className="mb-8 border-b border-gray-800 pb-6">
              <h3 className="text-lg font-medium mb-4 text-white">
                Customer Information
              </h3>
              <div className="bg-gray-900 p-4 rounded-lg border border-gray-800">
                {isLoadingCustomer ? (
                  <div className="flex items-center justify-center py-4">
                    <div className="w-6 h-6 border-2 border-dark-green border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-gray-400">
                      Loading customer information...
                    </span>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-400">Name</span>
                      <span className="font-medium">
                        {formData["shipping_address.first_name"]}{" "}
                        {formData["shipping_address.last_name"]}
                      </span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-400">Email</span>
                      <span className="font-medium">{formData.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Country</span>
                      <span className="font-medium">
                        {formData[
                          "shipping_address.country_code"
                        ]?.toUpperCase() || "US"}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>

            <AuthorizeNetPayment
              cardData={cardData}
              setCardData={setCardData}
              errorMessage={error}
              paymentMethod={selectedPaymentMethod}
              isAuthorizeNetFunc={isAuthorizeNetFunc}
              handleSubmit={handlePaymentComplete}
              isLoading={isLoading}
              buttonText="Complete Purchase"
            />
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  )
}

export default EpisodePaymentPopup
