import { Suspense } from "react"

import { listRegions } from "@lib/data/regions"
import { StoreRegion } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import CartButton from "@modules/layout/components/cart-button"
import SideMenu from "@modules/layout/components/side-menu"

export default async function Nav() {
  const regions = await listRegions().then((regions: StoreRegion[]) => regions)

  return (
    <div className="absolute top-0 inset-x-0 z-50 group">
      <header className="h-20 mx-auto duration-200">
        <nav className="px-8 md:px-12 text-white flex items-center justify-between w-full h-full text-small-regular max-w-[1440px] mx-auto">
          {/* Mobile burger menu */}
          <div className="sm:hidden flex items-center h-full">
            <SideMenu regions={regions} />
          </div>
          
          {/* Logo - centered on mobile */}
          <div className="flex items-center h-full justify-center sm:justify-start w-full sm:w-auto">
            <LocalizedClientLink
              href="/"
              className="hover:opacity-80 transition-opacity"
              data-testid="nav-store-link"
            >
              <img
                src="/assets/logo.png"
                alt="Logo"
                className="h-8 sm:h-10 object-contain" /* Smaller on mobile */
              />
            </LocalizedClientLink>
          </div>

          <div className="flex items-center gap-x-6 h-full flex-1 basis-0 justify-end">
            <div className="hidden small:flex items-center gap-x-6 h-full">
              <LocalizedClientLink
                className="text-white hover:text-white/80 transition-colors text-sm font-medium"
                href="/store"
                data-testid="nav-store-link"
              >
                Store
              </LocalizedClientLink>
              <LocalizedClientLink
                className="text-white hover:text-white/80 transition-colors text-sm font-medium"
                href="/seasons"
                data-testid="nav-episodes-link"
              >
                Seasons
              </LocalizedClientLink>
              <LocalizedClientLink
                className="text-white hover:text-white/80 transition-colors text-sm font-medium"
                href="/sounds"
                data-testid="nav-sounds-link"
              >
                Sounds
              </LocalizedClientLink>
              <LocalizedClientLink
                className="text-white hover:text-white/80 transition-colors text-sm font-medium"
                href="/account"
                data-testid="nav-account-link"
              >
                Account
              </LocalizedClientLink>
            </div>
            <Suspense
              fallback={
                <LocalizedClientLink
                  className="text-white hover:text-white/80 transition-colors"
                  href="/cart"
                  data-testid="nav-cart-link"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </LocalizedClientLink>
              }
            >
              <CartButton />
            </Suspense>
          </div>
        </nav>
      </header>
    </div>
  )
}
