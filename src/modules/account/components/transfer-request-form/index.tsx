"use client"

import { useActionState } from "react"
import { createTransferRequest } from "@lib/data/orders"
import { Text, Heading, Input, Button, IconButton, Toaster } from "@medusajs/ui"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import { CheckCircleMiniSolid, XCircleSolid } from "@medusajs/icons"
import { useEffect, useState } from "react"

export default function TransferRequestForm() {
  const [showSuccess, setShowSuccess] = useState(false)

  const [state, formAction] = useActionState(createTransferRequest, {
    success: false,
    error: null,
    order: null,
  })

  useEffect(() => {
    if (state.success && state.order) {
      setShowSuccess(true)
    }
  }, [state.success, state.order])

  return (
    <div className="flex flex-col gap-y-6 w-full">
      <div className="bg-black/30 backdrop-blur-md border border-white/10 rounded-xl p-6 grid sm:grid-cols-2 items-center gap-x-8 gap-y-6 w-full">
        <div className="flex flex-col gap-y-3">
          <div className="flex items-center gap-3">
            <div className="bg-blue-500/10 p-2 rounded-lg">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-light-green"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                />
              </svg>
            </div>
            <Heading level="h3" className="text-lg font-semibold text-white">
              Order Transfers
            </Heading>
          </div>
          <Text className="text-white/70">
            Can&apos;t find the order you are looking for?
            <br /> Connect an order to your account.
          </Text>
        </div>
        <form
          action={formAction}
          className="flex flex-col gap-y-4 sm:items-end"
        >
          <div className="flex flex-col gap-y-3 w-full">
            <div className="relative w-full">
              <label
                htmlFor="order_id"
                className="text-sm text-white/80 mb-1 block"
              >
                Order ID
              </label>
              <Input
                id="order_id"
                className="w-full bg-black/40 border-white/20 text-white placeholder:text-white/60 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 hover:border-white/40 transition-colors"
                name="order_id"
                placeholder="Enter your Order ID"
              />
            </div>
            <SubmitButton className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 py-2.5 px-6 w-fit whitespace-nowrap self-end mt-2 font-medium">
              Request Transfer
            </SubmitButton>
          </div>
        </form>
      </div>
      {!state.success && state.error && (
        <Text className="text-rose-400 text-right">{state.error}</Text>
      )}
      {showSuccess && (
        <div className="flex justify-between p-5 bg-black/30 backdrop-blur-md border border-emerald-500/20 rounded-xl w-full self-stretch items-center">
          <div className="flex gap-x-3 items-center">
            <div className="bg-emerald-500/10 p-2 rounded-lg">
              <CheckCircleMiniSolid className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="flex flex-col gap-y-1">
              <Text className="text-white font-medium">
                Transfer for order {state.order?.id} requested
              </Text>
              <Text className="text-white/70 text-sm">
                Transfer request email sent to {state.order?.email}
              </Text>
            </div>
          </div>
          <IconButton
            className="bg-white/10 hover:bg-white/20 rounded-full p-1.5 transition-colors duration-200"
            onClick={() => setShowSuccess(false)}
          >
            <XCircleSolid className="w-5 h-5 text-white/70" />
          </IconButton>
        </div>
      )}
    </div>
  )
}
