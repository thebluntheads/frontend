"use client"

import {
  Popover,
  PopoverButton,
  PopoverPanel,
  Transition,
} from "@headlessui/react"
import { convertToLocale } from "@lib/util/money"
import { HttpTypes } from "@medusajs/types"
import { Button } from "@medusajs/ui"
import DeleteButton from "@modules/common/components/delete-button"
import LineItemOptions from "@modules/common/components/line-item-options"
import LineItemPrice from "@modules/common/components/line-item-price"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Thumbnail from "@modules/products/components/thumbnail"
import { usePathname } from "next/navigation"
import { Fragment, useEffect, useRef, useState } from "react"

const CartDropdown = ({
  cart: cartState,
}: {
  cart?: HttpTypes.StoreCart | null
}) => {
  const [activeTimer, setActiveTimer] = useState<NodeJS.Timer | undefined>(
    undefined
  )
  const [cartDropdownOpen, setCartDropdownOpen] = useState(false)

  const open = () => setCartDropdownOpen(true)
  const close = () => setCartDropdownOpen(false)

  const totalItems =
    cartState?.items?.reduce((acc, item) => {
      return acc + item.quantity
    }, 0) || 0

  const subtotal = cartState?.subtotal ?? 0
  const itemRef = useRef<number>(totalItems || 0)

  const timedOpen = () => {
    open()

    const timer = setTimeout(close, 5000)

    setActiveTimer(timer)
  }

  const openAndCancel = () => {
    if (activeTimer) {
      clearTimeout(activeTimer)
    }

    open()
  }

  // Clean up the timer when the component unmounts
  useEffect(() => {
    return () => {
      if (activeTimer) {
        clearTimeout(activeTimer)
      }
    }
  }, [activeTimer])

  const pathname = usePathname()

  // open cart dropdown when modifying the cart items, but only if we're not on the cart page
  useEffect(() => {
    if (itemRef.current !== totalItems && !pathname.includes("/cart")) {
      timedOpen()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalItems, itemRef.current])

  return (
    <div
      className="h-full z-50"
      onMouseEnter={openAndCancel}
      onMouseLeave={close}
    >
      <Popover className="relative h-full">
        <PopoverButton className="h-full">
          <LocalizedClientLink
            className="text-white hover:text-white/80 transition-colors relative"
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
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-white text-black text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </LocalizedClientLink>
        </PopoverButton>
        <Transition
          show={cartDropdownOpen}
          as={Fragment}
          enter="transition ease-out duration-200"
          enterFrom="opacity-0 translate-y-1"
          enterTo="opacity-100 translate-y-0"
          leave="transition ease-in duration-150"
          leaveFrom="opacity-100 translate-y-0"
          leaveTo="opacity-0 translate-y-1"
        >
          <PopoverPanel
            static
            className="hidden small:block absolute top-[calc(100%+1px)] right-0 bg-black/80 backdrop-blur-md border border-white/10 rounded-xl shadow-2xl w-[420px] text-white overflow-hidden"
            data-testid="nav-cart-dropdown"
          >
            <div className="p-5 flex items-center justify-between bg-black/40 border-b border-white/10">
              <h3 className="text-xl font-bold text-white">Your Cart</h3>
              <span className="bg-dark-green/20 text-light-green text-sm font-medium px-3 py-1 rounded-full">
                {totalItems} {totalItems === 1 ? "item" : "items"}
              </span>
            </div>
            {cartState && cartState.items?.length ? (
              <>
                <div className="overflow-y-scroll max-h-[402px] grid grid-cols-1 gap-y-4 no-scrollbar">
                  {cartState.items
                    .sort((a, b) => {
                      return (a.created_at ?? "") > (b.created_at ?? "")
                        ? -1
                        : 1
                    })
                    .map((item) => (
                      <div
                        className="p-4 border-b border-white/5 hover:bg-white/5 transition-colors duration-200"
                        key={item.id}
                        data-testid="cart-item"
                      >
                        <div className="grid grid-cols-[100px_1fr] gap-x-4">
                          <LocalizedClientLink
                            href={`/products/${item.product_handle}`}
                            className="w-24"
                          >
                            <div className="bg-black/20 rounded-lg overflow-hidden border border-white/5">
                              <Thumbnail
                                thumbnail={item.thumbnail}
                                images={item.variant?.product?.images}
                                size="square"
                              />
                            </div>
                          </LocalizedClientLink>
                          <div className="flex flex-col justify-between flex-1">
                            <div className="flex flex-col flex-1">
                              <div className="flex items-start justify-between">
                                <div className="flex flex-col overflow-ellipsis mr-4 w-[180px]">
                                  <h3 className="text-white font-medium overflow-hidden text-ellipsis">
                                    <LocalizedClientLink
                                      href={`/products/${item.product_handle}`}
                                      data-testid="product-link"
                                      className="hover:text-light-green transition-colors duration-200"
                                    >
                                      {item.title}
                                    </LocalizedClientLink>
                                  </h3>
                                  <div className="text-white/70 text-sm mt-1">
                                    <LineItemOptions
                                      variant={item.variant}
                                      data-testid="cart-item-variant"
                                      data-value={item.variant}
                                    />
                                  </div>
                                  <div className="flex items-center mt-2">
                                    <span
                                      data-testid="cart-item-quantity"
                                      data-value={item.quantity}
                                      className="bg-black/30 text-white/80 text-xs px-2 py-1 rounded-md"
                                    >
                                      Qty: {item.quantity}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex justify-end">
                                  <LineItemPrice
                                    item={item}
                                    style="tight"
                                    currencyCode={cartState.currency_code}
                                  />
                                </div>
                              </div>
                            </div>
                            <div className="mt-3 flex justify-end">
                              <DeleteButton
                                id={item.id}
                                className="text-xs text-white/60 hover:text-red-400 transition-colors duration-200"
                                data-testid="cart-item-remove-button"
                              >
                                Remove
                              </DeleteButton>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
                <div className="p-5 flex flex-col gap-y-4 bg-black/40 border-t border-white/10">
                  <div className="flex items-center justify-between">
                    <span className="text-white font-medium">
                      Subtotal{" "}
                      <span className="text-white/60 text-sm">
                        (excl. taxes)
                      </span>
                    </span>
                    <span
                      className="text-xl font-bold text-white"
                      data-testid="cart-subtotal"
                      data-value={subtotal}
                    >
                      {convertToLocale({
                        amount: subtotal,
                        currency_code: cartState.currency_code,
                      })}
                    </span>
                  </div>
                  <div className="flex gap-3 mt-2">
                    <LocalizedClientLink
                      href="/cart"
                      passHref
                      className="flex-1"
                    >
                      <Button
                        className="w-full bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-lg transition-colors duration-200 py-2.5"
                        size="large"
                        data-testid="go-to-cart-button"
                      >
                        View Cart
                      </Button>
                    </LocalizedClientLink>
                    <LocalizedClientLink
                      href="/checkout"
                      passHref
                      className="flex-1"
                    >
                      <Button
                        className="w-full bg-dark-green hover:bg-dark-green text-white rounded-lg transition-colors duration-200 py-2.5"
                        size="large"
                      >
                        Checkout
                      </Button>
                    </LocalizedClientLink>
                  </div>
                </div>
              </>
            ) : (
              <div className="p-8">
                <div className="flex py-12 flex-col gap-y-6 items-center justify-center text-center">
                  <div className="bg-black/30 border border-white/10 p-6 rounded-full">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-10 w-10 text-white/50"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                      />
                    </svg>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-white">
                      Your cart is empty
                    </h3>
                    <p className="text-white/60 max-w-xs">
                      Looks like you haven't added anything to your cart yet.
                    </p>
                  </div>
                  <div className="pt-4">
                    <LocalizedClientLink href="/store">
                      <>
                        <span className="sr-only">Go to all products page</span>
                        <Button
                          onClick={close}
                          className="bg-dark-green hover:bg-dark-green text-white rounded-lg transition-colors duration-200 px-6 py-2.5"
                        >
                          Browse Products
                        </Button>
                      </>
                    </LocalizedClientLink>
                  </div>
                </div>
              </div>
            )}
          </PopoverPanel>
        </Transition>
      </Popover>
    </div>
  )
}

export default CartDropdown
