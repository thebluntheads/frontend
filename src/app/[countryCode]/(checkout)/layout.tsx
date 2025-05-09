import LocalizedClientLink from "@modules/common/components/localized-client-link"
import ChevronDown from "@modules/common/icons/chevron-down"
import MedusaCTA from "@modules/layout/components/medusa-cta"

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="w-full bg-gradient-to-b from-black via-black to-black relative small:min-h-screen text-white">
      <div className="h-16 bg-black/30 backdrop-blur-md border-b border-white/5">
        <nav className="flex h-full items-center content-container justify-between">
          <LocalizedClientLink
            href="/cart"
            className="text-small-semi text-white flex items-center gap-x-2 uppercase flex-1 basis-0 hover:opacity-80 transition-all duration-200"
            data-testid="back-to-cart-link"
          >
            <ChevronDown className="rotate-90" size={16} />
            <span className="mt-px hidden small:block txt-compact-plus text-white/80 hover:text-white group-hover:text-white">
              Back to shopping cart
            </span>
            <span className="mt-px block small:hidden txt-compact-plus text-white/80 hover:text-white">
              Back
            </span>
          </LocalizedClientLink>
          <LocalizedClientLink
            href="/"
            className="flex items-center justify-center"
            data-testid="store-link"
          >
            <img
              src="/assets/logo.png"
              alt="Logo"
              className="h-8 object-contain"
            />
          </LocalizedClientLink>
          <div className="flex-1 basis-0" />
        </nav>
      </div>
      <div className="relative" data-testid="checkout-container">
        {children}
      </div>
    </div>
  )
}
