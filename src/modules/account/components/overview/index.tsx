import { Container } from "@medusajs/ui"

import ChevronDown from "@modules/common/icons/chevron-down"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { convertToLocale } from "@lib/util/money"
import { HttpTypes } from "@medusajs/types"

type OverviewProps = {
  customer: HttpTypes.StoreCustomer | null
  orders: HttpTypes.StoreOrder[] | null
}

const Overview = ({ customer, orders }: OverviewProps) => {
  return (
    <div data-testid="overview-page-wrapper" className="w-full">
      <div className="hidden small:block">
        <div className="flex items-center gap-4 mb-6">
          <div className="bg-blue-500/20 p-3 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white" data-testid="welcome-message" data-value={customer?.first_name}>
              Welcome back, {customer?.first_name}
            </h1>
            <p className="text-white/60 text-sm mt-1">
              Signed in as:{" "}
              <span
                className="text-white/80 font-medium"
                data-testid="customer-email"
                data-value={customer?.email}
              >
                {customer?.email}
              </span>
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-6 mb-8">
          <div className="bg-black/30 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-blue-500/10 p-2 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white">Profile Completion</h3>
            </div>
            <div className="mt-2">
              <div className="w-full bg-black/40 rounded-full h-2.5 mb-3">
                <div 
                  className="bg-blue-500 h-2.5 rounded-full" 
                  style={{ width: `${getProfileCompletion(customer)}%` }}
                  data-testid="customer-profile-completion"
                  data-value={getProfileCompletion(customer)}
                ></div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/60 text-sm">
                  {getProfileCompletion(customer)}% Complete
                </span>
                <LocalizedClientLink 
                  href="/account/profile"
                  className="text-blue-400 text-sm hover:text-blue-300 transition-colors duration-200"
                >
                  Complete Profile
                </LocalizedClientLink>
              </div>
            </div>
          </div>

          <div className="bg-black/30 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-blue-500/10 p-2 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white">Saved Addresses</h3>
            </div>
            <div className="flex items-center justify-between mt-4">
              <div>
                <span
                  className="text-3xl font-bold text-white"
                  data-testid="addresses-count"
                  data-value={customer?.addresses?.length || 0}
                >
                  {customer?.addresses?.length || 0}
                </span>
                <span className="text-white/60 text-sm ml-2">
                  {customer?.addresses?.length === 1 ? 'Address' : 'Addresses'} Saved
                </span>
              </div>
              <LocalizedClientLink 
                href="/account/addresses"
                className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-colors duration-200 text-sm"
              >
                Manage Addresses
              </LocalizedClientLink>
            </div>
          </div>
        </div>

        <div className="bg-black/30 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-blue-500/10 p-2 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white">Recent Orders</h3>
          </div>
          
          <ul className="flex flex-col gap-y-3 mt-2" data-testid="orders-wrapper">
            {orders && orders.length > 0 ? (
              orders.slice(0, 5).map((order) => {
                return (
                  <li
                    key={order.id}
                    data-testid="order-wrapper"
                    data-value={order.id}
                    className="border border-white/5 rounded-lg overflow-hidden hover:bg-white/5 transition-colors duration-200"
                  >
                    <LocalizedClientLink
                      href={`/account/orders/details/${order.id}`}
                    >
                      <div className="p-4 flex justify-between items-center">
                        <div className="grid grid-cols-3 grid-rows-2 gap-x-4 gap-y-1 flex-1">
                          <span className="text-white/50 text-xs">Date placed</span>
                          <span className="text-white/50 text-xs">
                            Order number
                          </span>
                          <span className="text-white/50 text-xs">
                            Total amount
                          </span>
                          <span className="text-white text-sm" data-testid="order-created-date">
                            {new Date(order.created_at).toDateString()}
                          </span>
                          <span
                            className="text-white text-sm"
                            data-testid="order-id"
                            data-value={order.display_id}
                          >
                            #{order.display_id}
                          </span>
                          <span className="text-white text-sm font-medium" data-testid="order-amount">
                            {convertToLocale({
                              amount: order.total,
                              currency_code: order.currency_code,
                            })}
                          </span>
                        </div>
                        <button
                          className="flex items-center justify-between text-white/60 hover:text-white transition-colors duration-200"
                          data-testid="open-order-button"
                        >
                          <span className="sr-only">
                            Go to order #{order.display_id}
                          </span>
                          <ChevronDown className="-rotate-90" />
                        </button>
                      </div>
                    </LocalizedClientLink>
                  </li>
                )
              })
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="bg-black/20 p-4 rounded-full mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 12H4" />
                  </svg>
                </div>
                <span className="text-white/60" data-testid="no-orders-message">You haven't placed any orders yet</span>
                <LocalizedClientLink 
                  href="/store"
                  className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 text-sm"
                >
                  Browse Products
                </LocalizedClientLink>
              </div>
            )}
          </ul>
        </div>
      </div>
    </div>
  )
}

const getProfileCompletion = (customer: HttpTypes.StoreCustomer | null) => {
  let count = 0

  if (!customer) {
    return 0
  }

  if (customer.email) {
    count++
  }

  if (customer.first_name && customer.last_name) {
    count++
  }

  if (customer.phone) {
    count++
  }

  const billingAddress = customer.addresses?.find(
    (addr) => addr.is_default_billing
  )

  if (billingAddress) {
    count++
  }

  return (count / 4) * 100
}

export default Overview
