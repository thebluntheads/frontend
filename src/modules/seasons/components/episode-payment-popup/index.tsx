"use client"

import React, { useEffect, useState } from "react"
import { Dialog } from "@headlessui/react"
import { XMark } from "@medusajs/icons"
import { Button } from "@medusajs/ui"
import {
  setStreamShippingMethod,
  updateStreamCart,
} from "@lib/data/digital-cart"
import { StoreCart, StoreCartShippingOption } from "@medusajs/types"
import { useCustomer } from "@lib/hooks/use-customer"
import { initiatePaymentSession, retrieveCart } from "@lib/data/cart"

/**
 * Single-item digital purchase popup.
 *
 * After dropping Authorize.net, the only supported flow is Clover Hosted
 * Checkout. The user clicks "Pay with Clover", we initiate a payment session,
 * read the Clover hosted page URL from the session data, and redirect them.
 * Order completion happens server-side via the Clover webhook + the
 * `/checkout/return` page polling for cart completion.
 */
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
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [newCart, setNewCart] = useState<StoreCart | null>(null)
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

  const hasClover = availablePaymentMethods?.some(
    (m: any) => m.id === "pp_clover_clover"
  )

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

  // Populate the cart with the customer's default address + shipping method
  // before the user can pay. Same as before — Clover doesn't change this step.
  useEffect(() => {
    if (!isOpen) return
    const setupCart = async () => {
      try {
        if (customer && !cart?.shipping_address) {
          const defaultAddress = {
            first_name: customer.first_name || "",
            last_name: customer.last_name || "",
            address_1: "Default Address",
            postal_code: "00000",
            city: "Default City",
            country_code:
              customer.billing_address?.country_code || "us",
            province: "",
            phone: "",
          }
          await updateStreamCart({
            shipping_address: defaultAddress,
            billing_address: defaultAddress,
            email: customer.email || "",
          })
          const updatedCart = await retrieveCart(cart.id)
          setNewCart(updatedCart as StoreCart | null)
        } else {
          setNewCart(cart)
        }
      } catch (e) {
        console.error("[episode-popup] failed to setup cart", e)
      }
    }
    setupCart()
  }, [isOpen, customer, cart])

  const assignShippingMethod = async () => {
    if (!newCart?.shipping_methods?.length && shippingMethod?.id) {
      await setStreamShippingMethod({
        cartId: cart.id,
        shippingMethodId: shippingMethod.id,
      })
      const updatedCart = await retrieveCart(cart.id)
      setNewCart(updatedCart as StoreCart | null)
    }
  }

  const handlePayWithClover = async () => {
    setIsLoading(true)
    setErrorMessage(null)

    try {
      if (!hasClover) {
        setErrorMessage(
          "Clover payment is not available for this region. Please contact support."
        )
        return
      }

      if (newCart?.shipping_methods?.length === 0) {
        await assignShippingMethod()
      }

      // Re-fetch the cart immediately before initiating so we have the latest
      // totals + items. The cart prop can be stale right after add-to-cart.
      const freshCart = (await retrieveCart(cart.id)) ?? cart
      console.log("[episode-popup] freshCart at pay time", {
        id: freshCart?.id,
        total: (freshCart as any)?.total,
        item_total: (freshCart as any)?.item_total,
        items: freshCart?.items?.map((i: any) => ({
          title: i.title,
          unit_price: i.unit_price,
          total: i.total,
          quantity: i.quantity,
        })),
        region_currency: (freshCart as any)?.region?.currency_code,
      })

      if (!(freshCart as any)?.total || Number((freshCart as any).total) <= 0) {
        setErrorMessage(
          "Cart total is 0 — make sure the item has a price in your region. Check the Medusa admin product/variant prices."
        )
        return
      }

      // After Clover, the user always returns to /{countryCode}/checkout
      // with a `clover_status` query param. The checkout page renders:
      //   - clover_status=success → CloverCompletion (polls + finalizes order)
      //   - clover_status=failure → banner + normal checkout
      //   - clover_status=cancel  → banner + normal checkout
      const countryCode =
        (typeof window !== "undefined" &&
          window.location.pathname.split("/")[1]) ||
        "us"
      const checkoutBase = `${window.location.origin}/${countryCode}/checkout`
      const successUrl = `${checkoutBase}?clover_status=success&cart_id=${freshCart.id}`
      const failureUrl = `${checkoutBase}?clover_status=failure&cart_id=${freshCart.id}`
      const cancelUrl = `${checkoutBase}?clover_status=cancel&cart_id=${freshCart.id}`

      const payc = await initiatePaymentSession(freshCart as any, {
        provider_id: "pp_clover_clover",
        data: {
          successUrl,
          cancelUrl,
          failureUrl,
          email: formData.email,
          customer: {
            email: formData.email,
            first_name: formData["shipping_address.first_name"],
            last_name: formData["shipping_address.last_name"],
            phone: formData["shipping_address.phone"],
          },
          billing_address: (freshCart as any).billing_address,
        },
      })

      const pendingSession = payc?.payment_collection?.payment_sessions?.find(
        (session: any) => session.status === "pending"
      )
      const href = pendingSession?.data?.href as string | undefined

      if (href) {
        window.location.href = href
        return
      }

      setErrorMessage("Could not start Clover checkout. Please try again.")
    } catch (err: any) {
      console.error("[episode-popup] payment error", err)
      setErrorMessage(err?.message || "Payment failed. Please try again.")
    } finally {
      setIsLoading(false)
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
                {cart?.items?.map((item) => (
                  <React.Fragment key={item.id}>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-400">Item</span>
                      <span className="font-medium">
                        {item?.title || "Episode"}
                      </span>
                    </div>
                    <div className="flex justify-between mb-2 border-b border-gray-700">
                      <span className="text-gray-400">Price</span>
                      <span className="font-medium">
                        {cart?.region?.currency_code?.toUpperCase()}{" "}
                        {item?.unit_price || 0}
                      </span>
                    </div>
                  </React.Fragment>
                ))}

                {(cart as any)?.discount_total > 0 && (
                  <div className="flex justify-between mb-2 text-green-600">
                    <span>Discount</span>
                    <span>
                      - {cart?.region?.currency_code?.toUpperCase()}{" "}
                      {(cart as any)?.discount_total}
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

            {/* Pay with Clover */}
            <div className="mb-6">
              <Button
                size="large"
                className="w-full h-14 text-base rounded-full bg-dark-green hover:bg-dark-green shadow-md text-white"
                onClick={handlePayWithClover}
                isLoading={isLoading}
                disabled={!hasClover || isLoading}
              >
                Pay with Clover
              </Button>
              {!hasClover && (
                <p className="mt-3 text-sm text-red-300">
                  Clover payment isn&apos;t enabled for your region. Please
                  contact support.
                </p>
              )}
            </div>

            {errorMessage && (
              <div className="mb-6 p-4 border border-red-700 rounded-md bg-red-900/50">
                <p className="text-red-300">{errorMessage}</p>
              </div>
            )}
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  )
}

export default EpisodePaymentPopup
