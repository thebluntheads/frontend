"use client"

import { clx } from "@medusajs/ui"
import { ArrowRightOnRectangle } from "@medusajs/icons"
import { useParams, usePathname } from "next/navigation"

import ChevronDown from "@modules/common/icons/chevron-down"
import User from "@modules/common/icons/user"
import MapPin from "@modules/common/icons/map-pin"
import Package from "@modules/common/icons/package"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { HttpTypes } from "@medusajs/types"
import { signout } from "@lib/data/customer"

const AccountNav = ({
  customer,
}: {
  customer: HttpTypes.StoreCustomer | null
}) => {
  const route = usePathname()
  const { countryCode } = useParams() as { countryCode: string }

  const handleLogout = async () => {
    await signout(countryCode)
  }

  return (
    <div>
      <div className="small:hidden" data-testid="mobile-account-nav">
        {route !== `/${countryCode}/account` ? (
          <LocalizedClientLink
            href="/account"
            className="flex items-center gap-x-2 text-white py-2 bg-black/30 backdrop-blur-md border border-white/10 rounded-lg px-4"
            data-testid="account-main-link"
          >
            <>
              <ChevronDown className="transform rotate-90 text-blue-400" />
              <span>Account</span>
            </>
          </LocalizedClientLink>
        ) : (
          <>
            <div className="bg-black/30 backdrop-blur-md border border-white/10 rounded-xl p-5 mb-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-blue-500/10 p-2 rounded-lg">
                  <User className="text-blue-400 h-5 w-5" />
                </div>
                <div className="text-xl font-bold text-white">
                  Hello {customer?.first_name}
                </div>
              </div>
            </div>
            <div className="bg-black/30 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden">
              <ul>
                <li>
                  <LocalizedClientLink
                    href="/account/profile"
                    className="flex items-center justify-between py-4 border-b border-white/10 px-5 hover:bg-white/5 transition-colors duration-200"
                    data-testid="profile-link"
                  >
                    <>
                      <div className="flex items-center gap-x-3">
                        <div className="bg-blue-500/10 p-1.5 rounded-lg">
                          <User className="text-blue-400 h-4 w-4" />
                        </div>
                        <span className="text-white">Profile</span>
                      </div>
                      <ChevronDown className="transform -rotate-90 text-white/60" />
                    </>
                  </LocalizedClientLink>
                </li>
                <li>
                  <LocalizedClientLink
                    href="/account/addresses"
                    className="flex items-center justify-between py-4 border-b border-white/10 px-5 hover:bg-white/5 transition-colors duration-200"
                    data-testid="addresses-link"
                  >
                    <>
                      <div className="flex items-center gap-x-3">
                        <div className="bg-blue-500/10 p-1.5 rounded-lg">
                          <MapPin className="text-blue-400 h-4 w-4" />
                        </div>
                        <span className="text-white">Addresses</span>
                      </div>
                      <ChevronDown className="transform -rotate-90 text-white/60" />
                    </>
                  </LocalizedClientLink>
                </li>
                <li>
                  <LocalizedClientLink
                    href="/account/orders"
                    className="flex items-center justify-between py-4 border-b border-white/10 px-5 hover:bg-white/5 transition-colors duration-200"
                    data-testid="orders-link"
                  >
                    <div className="flex items-center gap-x-3">
                      <div className="bg-blue-500/10 p-1.5 rounded-lg">
                        <Package className="text-blue-400 h-4 w-4" />
                      </div>
                      <span className="text-white">Orders</span>
                    </div>
                    <ChevronDown className="transform -rotate-90 text-white/60" />
                  </LocalizedClientLink>
                </li>
                <li>
                  <button
                    type="button"
                    className="flex items-center justify-between py-4 px-5 w-full hover:bg-white/5 transition-colors duration-200"
                    onClick={handleLogout}
                    data-testid="logout-button"
                  >
                    <div className="flex items-center gap-x-3">
                      <div className="bg-red-500/10 p-1.5 rounded-lg">
                        <ArrowRightOnRectangle className="text-red-400 h-4 w-4" />
                      </div>
                      <span className="text-white">Log out</span>
                    </div>
                    <ChevronDown className="transform -rotate-90 text-white/60" />
                  </button>
                </li>
              </ul>
            </div>
          </>
        )}
      </div>
      <div className="hidden small:block" data-testid="account-nav">
        <div className="bg-black/30 backdrop-blur-md border border-white/10 rounded-xl p-5 w-full">
          <div className="pb-4 border-b border-white/10 mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-blue-500/10 p-2 rounded-lg">
                <User className="text-blue-400 h-[18px] w-[18px]" />
              </div>
              <h3 className="text-lg font-semibold text-white">Account Menu</h3>
            </div>
          </div>
          <div>
            <ul className="flex mb-0 justify-start items-start flex-col gap-y-2">
              <li className="w-full">
                <AccountNavLink
                  href="/account"
                  route={route!}
                  data-testid="overview-link"
                >
                  <div className="flex items-center gap-x-3">
                    <div className="bg-blue-500/10 p-1.5 rounded-lg">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                    </div>
                    <span>Overview</span>
                  </div>
                </AccountNavLink>
              </li>
              <li className="w-full">
                <AccountNavLink
                  href="/account/profile"
                  route={route!}
                  data-testid="profile-link"
                >
                  <div className="flex items-center gap-x-3">
                    <div className="bg-blue-500/10 p-1.5 rounded-lg">
                      <User className="text-blue-400 h-4 w-4" />
                    </div>
                    <span>Profile</span>
                  </div>
                </AccountNavLink>
              </li>
              <li className="w-full">
                <AccountNavLink
                  href="/account/addresses"
                  route={route!}
                  data-testid="addresses-link"
                >
                  <div className="flex items-center gap-x-3">
                    <div className="bg-blue-500/10 p-1.5 rounded-lg">
                      <MapPin className="text-blue-400 h-4 w-4" />
                    </div>
                    <span>Addresses</span>
                  </div>
                </AccountNavLink>
              </li>
              <li className="w-full">
                <AccountNavLink
                  href="/account/orders"
                  route={route!}
                  data-testid="orders-link"
                >
                  <div className="flex items-center gap-x-3">
                    <div className="bg-blue-500/10 p-1.5 rounded-lg">
                      <Package className="text-blue-400 h-4 w-4" />
                    </div>
                    <span>Orders</span>
                  </div>
                </AccountNavLink>
              </li>
              <li className="w-full mt-2 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex items-center gap-x-3 py-2 px-3 w-full text-left rounded-lg hover:bg-white/5 transition-colors duration-200 text-white/80 hover:text-white"
                  data-testid="logout-button"
                >
                  <div className="bg-red-500/10 p-1.5 rounded-lg">
                    <ArrowRightOnRectangle className="text-red-400 h-4 w-4" />
                  </div>
                  <span>Log out</span>
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

type AccountNavLinkProps = {
  href: string
  route: string
  children: React.ReactNode
  "data-testid"?: string
}

const AccountNavLink = ({
  href,
  route,
  children,
  "data-testid": dataTestId,
}: AccountNavLinkProps) => {
  const { countryCode }: { countryCode: string } = useParams()

  const active = route.split(countryCode)[1] === href
  return (
    <LocalizedClientLink
      href={href}
      className={clx("py-2 px-3 w-full block rounded-lg transition-colors duration-200 text-white/80 hover:text-white hover:bg-white/5", {
        "bg-white/10 text-white font-medium": active,
      })}
      data-testid={dataTestId}
    >
      {children}
    </LocalizedClientLink>
  )
}

export default AccountNav
