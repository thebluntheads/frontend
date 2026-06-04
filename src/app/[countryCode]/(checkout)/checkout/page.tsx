import { retrieveCart } from "@lib/data/cart"
import { retrieveCustomer } from "@lib/data/customer"
import PaymentWrapper from "@modules/checkout/components/payment-wrapper"
import CheckoutForm from "@modules/checkout/templates/checkout-form"
import CheckoutSummary from "@modules/checkout/templates/checkout-summary"
import CloverCompletion from "@modules/checkout/components/clover-completion"
import CloverStatusBanner from "@modules/checkout/components/clover-status-banner"
import { Metadata } from "next"
import { notFound } from "next/navigation"

export const metadata: Metadata = {
  title: "Checkout",
}

type CheckoutSearchParams = {
  clover_status?: "success" | "failure" | "cancel" | string
  cart_id?: string
}

export default async function Checkout({
  searchParams,
}: {
  searchParams: Promise<CheckoutSearchParams>
}) {
  const { clover_status, cart_id } = (await searchParams) ?? {}

  // Success — Clover authorized the payment. Switch to the completion view,
  // which polls placeOrder until the cart is ready and then redirects to
  // /order/{id}/confirmed.
  if (clover_status === "success") {
    return <CloverCompletion cartId={cart_id} />
  }

  const cart = await retrieveCart()

  if (!cart) {
    return notFound()
  }

  const customer = await retrieveCustomer()

  const isFailure = clover_status === "failure" || clover_status === "cancel"

  return (
    <div className="content-container py-12">
      {isFailure && (
        <CloverStatusBanner
          status={clover_status === "cancel" ? "cancel" : "failure"}
        />
      )}
      <div className="grid grid-cols-1 small:grid-cols-[1fr_416px] gap-x-40">
        <PaymentWrapper cart={cart}>
          <CheckoutForm cart={cart} customer={customer} />
        </PaymentWrapper>
        <CheckoutSummary cart={cart} />
      </div>
    </div>
  )
}
