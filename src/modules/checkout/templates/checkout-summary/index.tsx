import { Heading } from "@medusajs/ui"

import ItemsPreviewTemplate from "@modules/cart/templates/preview"
import DiscountCode from "@modules/checkout/components/discount-code"
import CartTotals from "@modules/common/components/cart-totals"
import Divider from "@modules/common/components/divider"

const CheckoutSummary = ({ cart }: { cart: any }) => {
  return (
    <div className="sticky top-0 flex flex-col-reverse small:flex-col gap-y-8 py-8 small:py-0">
      <div className="w-full bg-black/30 backdrop-blur-md rounded-xl shadow-2xl border border-white/10 p-8 flex flex-col">
        <Divider className="my-6 small:hidden border-white/20" />
        <Heading
          level="h2"
          className="flex flex-row text-[2.5rem] leading-[3rem] font-bold text-white items-baseline"
        >
          In your Cart
        </Heading>
        <Divider className="my-6 border-white/20" />
        <CartTotals totals={cart} />
        <ItemsPreviewTemplate cart={cart} />
        <div className="my-6">
          <DiscountCode cart={cart} />
        </div>
      </div>
    </div>
  )
}

export default CheckoutSummary
