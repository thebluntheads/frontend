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
import { initiatePaymentSession } from "@lib/data/cart"

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

  const [cardData, setCardData] = useState<AuthorizeNetCardInfo>({
    cardNumber: "",
    expiration: "",
    cardCode: "",
    fullName: "",
  })

  const {
    dispatchData,
    loading,
    error: err,
  } = useAcceptJs({ environment: "PRODUCTION", authData })
  const [month, year] = cardData.expiration.split("/")

  // Use the custom hook to get customer information
  const { customer, isLoading: isLoadingCustomer } = useCustomer()

  // Shipping address state with minimal default values
  const [formData, setFormData] = useState<Record<string, any>>({
    "shipping_address.first_name": "",
    "shipping_address.last_name": "",
    "shipping_address.address_1": "Default Address",
    "shipping_address.company": "",
    "shipping_address.postal_code": "00000",
    "shipping_address.city": "Default City",
    "shipping_address.country_code": "us",
    "shipping_address.province": "",
    "shipping_address.phone": "",
    email: customer?.email,
  })

  // Update form data when customer information is loaded or cart changes
  useEffect(() => {
    // First, update with cart data if available
    if (cart) {
      setFormData((prevData) => ({
        ...prevData,
        "shipping_address.first_name":
          cart.shipping_address?.first_name ||
          prevData["shipping_address.first_name"],
        "shipping_address.last_name":
          cart.shipping_address?.last_name ||
          prevData["shipping_address.last_name"],
        "shipping_address.address_1":
          cart.shipping_address?.address_1 ||
          prevData["shipping_address.address_1"],
        "shipping_address.company":
          cart.shipping_address?.company ||
          prevData["shipping_address.company"],
        "shipping_address.postal_code":
          cart.shipping_address?.postal_code ||
          prevData["shipping_address.postal_code"],
        "shipping_address.city":
          cart.shipping_address?.city || prevData["shipping_address.city"],
        "shipping_address.country_code":
          cart.shipping_address?.country_code ||
          prevData["shipping_address.country_code"],
        "shipping_address.province":
          cart.shipping_address?.province ||
          prevData["shipping_address.province"],
        "shipping_address.phone":
          cart.shipping_address?.phone || prevData["shipping_address.phone"],
        email: cart.email || prevData.email,
      }))
    }

    // Then, prioritize customer data if available (overrides cart data)
    if (customer) {
      setFormData((prevData) => ({
        ...prevData,
        // Basic customer info
        "shipping_address.first_name":
          customer.first_name || prevData["shipping_address.first_name"],
        "shipping_address.last_name":
          customer.last_name || prevData["shipping_address.last_name"],
        email: customer.email,

        // If customer has shipping addresses, use the first one
        ...(customer.shipping_addresses &&
        customer.shipping_addresses.length > 0
          ? {
              "shipping_address.address_1":
                customer.shipping_addresses[0].address_1,
              "shipping_address.city": customer.shipping_addresses[0].city,
              "shipping_address.postal_code":
                customer.shipping_addresses[0].postal_code,
              "shipping_address.province":
                customer.shipping_addresses[0].province || "",
              "shipping_address.country_code":
                customer.shipping_addresses[0].country_code,
              "shipping_address.phone":
                customer.shipping_addresses[0].phone || "",
            }
          : // Otherwise, if customer has a billing address, use it
          customer.billing_address
          ? {
              "shipping_address.address_1":
                customer.billing_address.address_1 ||
                prevData["shipping_address.address_1"],
              "shipping_address.city":
                customer.billing_address.city ||
                prevData["shipping_address.city"],
              "shipping_address.postal_code":
                customer.billing_address.postal_code ||
                prevData["shipping_address.postal_code"],
              "shipping_address.province":
                customer.billing_address.province ||
                prevData["shipping_address.province"],
              "shipping_address.country_code":
                customer.billing_address.country_code ||
                prevData["shipping_address.country_code"],
              "shipping_address.phone":
                customer.billing_address.phone ||
                prevData["shipping_address.phone"],
            }
          : {}),
      }))
    }
  }, [customer, cart?.id])

  const shippingMethod = useMemo(() => {
    return availableShippingMethods?.filter((sm) => sm.amount === 0)[0]
  }, [availableShippingMethods])

  console.log({ shippingMethod })

  // Handle payment completion
  const handlePaymentComplete = async () => {
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
          const payc = await initiatePaymentSession(cart!, {
            provider_id: selectedPaymentMethod,
            data: {
              billing_address: cart?.billing_address,
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
            await placeDigitalProductOrder()
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
        await initiatePaymentSession(cart!, {
          provider_id: selectedPaymentMethod,
        })
      }
    } catch (err: any) {
      console.log(err)
      const msg = err?.messages?.message?.[0]?.text || err.message
      setErrorMessage(msg)
    } finally {
      setIsLoading(false)
    }
  }

  // Auto-save address data when component loads
  useEffect(() => {
    const saveAddressData = async () => {
      if (!cart?.shipping_address) {
        setIsLoading(true)
        try {
          // Save address to cart
          const data = {
            shipping_address: {
              first_name: formData["shipping_address.first_name"],
              last_name: formData["shipping_address.last_name"],
              address_1:
                formData["shipping_address.address_1"] || "Default Address",
              address_2: "",
              company: formData["shipping_address.company"],
              postal_code: formData["shipping_address.postal_code"] || "00000",
              city: formData["shipping_address.city"] || "Default City",
              country_code: formData["shipping_address.country_code"],
              province: formData["shipping_address.province"],
              phone: formData["shipping_address.phone"],
            },
            email: formData.email,
            billing_address: {
              first_name: formData["shipping_address.first_name"],
              last_name: formData["shipping_address.last_name"],
              address_1:
                formData["shipping_address.address_1"] || "Default Address",
              address_2: "",
              company: formData["shipping_address.company"],
              postal_code: formData["shipping_address.postal_code"] || "00000",
              city: formData["shipping_address.city"] || "Default City",
              country_code: formData["shipping_address.country_code"],
              province: formData["shipping_address.province"],
              phone: formData["shipping_address.phone"],
            },
          }

          await updateStreamCart(data)
        } catch (err: any) {
          setErrorMessage(err.message)
        } finally {
          setIsLoading(false)
        }
      }
    }

    const saveShippingOption = async () => {
      if (cart?.shipping_methods?.length === 0) {
        try {
          await setStreamShippingMethod({
            cartId: cart.id,
            shippingMethodId: shippingMethod.id,
          })
        } catch (err: any) {
          setErrorMessage(err.message)
        } finally {
          setIsLoading(false)
        }
      }
    }

    if (isOpen) {
      saveAddressData()
      saveShippingOption()
    }
  }, [cart?.id, isOpen])

  // Clear errors when dialog opens
  useEffect(() => {
    setErrorMessage(null)
  }, [isOpen])

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-white/30" aria-hidden="true" />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-2xl rounded bg-white p-8 w-full max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <Dialog.Title className="text-2xl font-medium">
              Complete Your Purchase
            </Dialog.Title>
            <button
              onClick={onClose}
              className="p-1 rounded-full hover:bg-gray-100"
            >
              <XMark />
            </button>
          </div>

          <div className="bg-white">
            {/* Purchase Summary */}
            <div className="mb-8 border-b border-gray-200 pb-6">
              <h3 className="text-lg font-medium mb-4">Purchase Summary</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Item</span>
                  <span className="font-medium">
                    {cart?.items?.[0]?.title || "Episode"}
                  </span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Price</span>
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
                <div className="flex justify-between mt-4 pt-4 border-t border-gray-200">
                  <span className="font-medium">Total</span>
                  <span className="font-bold">
                    {cart?.region?.currency_code?.toUpperCase()}{" "}
                    {cart?.total || 0}
                  </span>
                </div>
              </div>
            </div>

            {/* Customer Information Display */}
            <div className="mb-8 border-b border-gray-200 pb-6">
              <h3 className="text-lg font-medium mb-4">Customer Information</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                {isLoadingCustomer ? (
                  <div className="flex items-center justify-center py-4">
                    <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <span className="ml-2 text-gray-600">
                      Loading customer information...
                    </span>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600">Name</span>
                      <span className="font-medium">
                        {formData["shipping_address.first_name"]}{" "}
                        {formData["shipping_address.last_name"]}
                      </span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600">Email</span>
                      <span className="font-medium">{formData.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Country</span>
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

            <div>
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
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  )
}

export default EpisodePaymentPopup
