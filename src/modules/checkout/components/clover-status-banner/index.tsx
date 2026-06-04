"use client"

import { useRouter } from "next/navigation"
import { Button, Text } from "@medusajs/ui"
import { useEffect, useState } from "react"

/**
 * Shown above the checkout form when Clover redirects back with a
 * non-success status. Distinguishes a hard failure from a user-cancel and
 * gives the user a clear next step (retry vs. choose another method).
 */
export default function CloverStatusBanner({
  status,
}: {
  status: "failure" | "cancel"
}) {
  const router = useRouter()
  const [dismissed, setDismissed] = useState(false)

  // Auto-clear the query string after a few seconds so a refresh doesn't
  // resurrect the banner.
  useEffect(() => {
    const t = setTimeout(() => {
      if (typeof window !== "undefined") {
        const url = new URL(window.location.href)
        url.searchParams.delete("clover_status")
        url.searchParams.delete("cart_id")
        router.replace(url.pathname + url.search)
      }
    }, 12000)
    return () => clearTimeout(t)
  }, [router])

  if (dismissed) return null

  const isCancel = status === "cancel"

  return (
    <div
      className={
        "mb-6 rounded-lg border px-5 py-4 flex items-start gap-4 " +
        (isCancel
          ? "border-yellow-700 bg-yellow-900/30 text-yellow-100"
          : "border-red-700 bg-red-900/30 text-red-100")
      }
      role="alert"
    >
      <div className="flex-1">
        <Text className="font-semibold mb-1">
          {isCancel
            ? "Payment cancelled"
            : "Payment didn’t go through"}
        </Text>
        <Text className="text-sm opacity-90">
          {isCancel
            ? "You cancelled the Clover checkout. Your cart is still here — pick a payment method below to try again."
            : "Clover reported a failure. Your card wasn’t charged. Please try again or choose a different payment method."}
        </Text>
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="text-current/70 hover:text-current text-xl leading-none"
        aria-label="Dismiss"
      >
        ×
      </button>
    </div>
  )
}
