import { Metadata } from "next"

import { listCartOptions, retrieveCart } from "@lib/data/cart"
import { retrieveCustomer } from "@lib/data/customer"
import { getBaseURL } from "@lib/util/env"
import { StoreCartShippingOption } from "@medusajs/types"
import CartMismatchBanner from "@modules/layout/components/cart-mismatch-banner"
import Footer from "@modules/layout/templates/footer"
import Nav from "@modules/layout/templates/nav"
import FreeShippingPriceNudge from "@modules/shipping/components/free-shipping-price-nudge"
import AuditionBanner from "@modules/audition/components/audition-banner"
import AuditionPopupWrapper from "@modules/audition/components/audition-popup-wrapper"

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
}

export default async function PageLayout(props: { children: React.ReactNode }) {
  const customer = await retrieveCustomer()
  const cart = await retrieveCart()
  let shippingOptions: StoreCartShippingOption[] = []

  if (cart) {
    const { shipping_options } = await listCartOptions()

    shippingOptions = shipping_options
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-black to-black text-white">
      {/* Audition popup that appears on all pages */}
      <AuditionPopupWrapper />
      
      {/* Fixed banner at the very top */}
      <div className="fixed top-0 inset-x-0 w-full z-50">
        <AuditionBanner />
      </div>
      
      {/* Fixed navigation below the banner - adjusted for mobile */}
      <div className="fixed top-[36px] sm:top-[48px] inset-x-0 w-full z-40">
        <Nav />
      </div>
      
      {/* Main content with padding to account for fixed banner and nav */}
      <div className="pt-[116px] sm:pt-[128px]">
        {customer && cart && (
          <CartMismatchBanner customer={customer} cart={cart} />
        )}
        {cart && (
          <FreeShippingPriceNudge
            variant="popup"
            cart={cart}
            shippingOptions={shippingOptions}
          />
        )}
        {props.children}
      </div>
      <Footer />
    </div>
  )
}
