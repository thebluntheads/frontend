"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button, Heading, Text } from "@medusajs/ui"
import { placeOrder, retrieveCart } from "@lib/data/cart"
import { placeDigitalProductOrder } from "@lib/data/digital-cart"

const MAX_ATTEMPTS = 20 // ~40 seconds total at 2s intervals
const POLL_INTERVAL_MS = 2000

/**
 * Rendered when the user returns to `/checkout?clover_status=success`.
 *
 * The Clover webhook (POST /hooks/payment/clover_clover) authorizes the
 * Medusa payment session in the background. This component polls
 * placeOrder/placeDigitalProductOrder until the cart can be completed,
 * then redirects to the order confirmation page.
 */
export default function CloverCompletion({
  cartId,
}: {
  cartId: string | undefined
}) {
  const router = useRouter()
  const [attempt, setAttempt] = useState(0)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const attemptComplete = useCallback(async () => {
    if (!cartId) {
      setErrorMessage("Missing cart reference — cannot complete order.")
      return
    }

    const cart = await retrieveCart(cartId)
    const isDigital = cart?.items?.some(
      (i: any) => i?.product_type_id === "ptyp_01JRX8NFV7EZVBXKBJ9ZHSEJ0W"
    )

    // placeOrder / placeDigitalProductOrder redirect to the order confirmation
    // page on success, so the happy path never resolves here.
    if (isDigital) {
      await placeDigitalProductOrder(cartId)
    } else {
      await placeOrder(cartId)
    }
  }, [cartId])

  useEffect(() => {
    if (!cartId) return

    let cancelled = false

    const run = async () => {
      try {
        await attemptComplete()
      } catch (e: any) {
        if (cancelled) return
        if (attempt + 1 >= MAX_ATTEMPTS) {
          setErrorMessage(
            "We couldn't finalize your order. If your Clover payment succeeded, " +
              "you'll receive a confirmation email shortly — otherwise please retry."
          )
          return
        }
        setTimeout(() => {
          if (!cancelled) setAttempt((n) => n + 1)
        }, POLL_INTERVAL_MS)
      }
    }
    run()

    return () => {
      cancelled = true
    }
  }, [attempt, attemptComplete, cartId])

  const showFailure = errorMessage !== null

  return (
    <div className="min-h-[50vh] flex items-center justify-center px-6 py-16">
      <div className="max-w-md w-full text-center text-white">
        {showFailure ? (
          <>
            <Heading level="h1" className="text-2xl font-semibold mb-3">
              Payment didn&apos;t complete
            </Heading>
            <Text className="text-gray-300 mb-6">{errorMessage}</Text>
            <Button
              size="large"
              className="bg-dark-green hover:bg-dark-green text-white px-6"
              onClick={() => router.push("/checkout")}
            >
              Back to checkout
            </Button>
          </>
        ) : (
          <>
            <Heading level="h1" className="text-2xl font-semibold mb-3">
              Finalizing your order…
            </Heading>
            <Text className="text-gray-300 mb-6">
              Confirming your payment with Clover. This usually takes a few seconds.
            </Text>
            <div className="inline-flex items-center gap-3">
              <svg
                className="animate-spin h-6 w-6 text-white"
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
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <span className="text-sm text-gray-400">
                Attempt {attempt + 1} / {MAX_ATTEMPTS}
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
