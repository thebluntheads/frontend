import { retrieveCart } from "@lib/data/cart"
import { retrieveCustomer } from "@lib/data/customer"
import CartTemplate from "@modules/cart/templates"
import { Metadata } from "next"
import { notFound } from "next/navigation"

export const metadata: Metadata = {
  title: "Cart",
  description: "View your cart",
}

export default async function Cart() {
  const cart = await retrieveCart()
  const customer = await retrieveCustomer()

  // Instead of showing a 404, we'll pass the cart (even if null) to the template
  // The template will handle displaying an empty cart message
  return <CartTemplate cart={cart} customer={customer} />
}
