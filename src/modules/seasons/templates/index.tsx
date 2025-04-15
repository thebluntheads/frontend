"use client"

import { getRegion } from "@lib/data/regions"
import {
  getCustomerDigitalProducts,
  listSeasonsEpisodes,
} from "@lib/data/digital-products"
import Image from "next/image"
import EpisodesList from "./episodes-list"
import { DigitalProduct } from "types/global"
import { Text, clx, Button } from "@medusajs/ui"
import { useEffect, useState } from "react"
import {
  getDigitalProductPrice,
  getProductPrice,
} from "@lib/util/get-product-price"
import { convertToLocale } from "@lib/util/money"
import {
  addToStreamCart,
  retrieveStreamCart,
  listStreamCartOptions,
  placeDigitalProductOrder,
} from "@lib/data/digital-cart"
import { StoreCart, StoreCartShippingOption } from "@medusajs/types"
import { listCartPaymentMethods } from "@lib/data/payment"
import EpisodePaymentPopup from "../components/episode-payment-popup"

export default function SeasonTemplate({
  season,
  countryCode,
}: {
  season: DigitalProduct
  countryCode: string
}) {
  const [region, setRegion] = useState<any>(null)
  const [episodes, setEpisodes] = useState<DigitalProduct[]>([])
  const [count, setCount] = useState(0)
  const [hasPurchased, setHasPurchased] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [cart, setCart] = useState<StoreCart | null>(null)
  const [isPaymentPopupOpen, setIsPaymentPopupOpen] = useState<boolean>(false)
  const [availablePaymentMethods, setAvailablePaymentMethods] = useState<any[]>(
    []
  )
  const [availableShippingMethods, setAvailableShippingMethods] = useState<
    StoreCartShippingOption[]
  >([])
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Format price
  const { cheapestPrice } = getDigitalProductPrice({
    variant: season.product_variant,
  })

  useEffect(() => {
    const fetchRegion = async () => {
      const regionData = await getRegion(countryCode)
      setRegion(regionData)
    }

    fetchRegion()
  }, [countryCode])

  // Fetch cart and payment methods
  useEffect(() => {
    const fetchCart = async () => {
      const cartData = await retrieveStreamCart()
      setCart(cartData)
    }

    fetchCart()
  }, [])

  useEffect(() => {
    const fetchPaymentAndShippingMethods = async () => {
      try {
        // Get payment methods
        const paymentMethods = await listCartPaymentMethods(cart?.region?.id!)
        setAvailablePaymentMethods(paymentMethods!)

        // Get shipping options
        const { shipping_options } = await listStreamCartOptions()
        setAvailableShippingMethods(shipping_options)
      } catch (error) {
        console.error("Error fetching payment or shipping methods:", error)
      }
    }

    if (cart) {
      fetchPaymentAndShippingMethods()
    }
  }, [cart])

  useEffect(() => {
    const fetchEpisodes = async () => {
      if (!season.id) return

      try {
        const result = await listSeasonsEpisodes({}, season.id)
        setEpisodes(result.digital_products)
        setCount(result.count)
      } catch (error) {
        console.error("Error fetching episodes:", error)
      }
    }

    fetchEpisodes()
  }, [season.id])

  useEffect(() => {
    const checkPurchase = async () => {
      try {
        const product_id = season?.id
        const parent_id = season?.parent_id || undefined
        const digitalProduct = await getCustomerDigitalProducts(
          product_id,
          parent_id
        )

        const hasPurchasedSeason = digitalProduct?.id === product_id
        setHasPurchased(hasPurchasedSeason)
        console.log("Has purchased season:", hasPurchasedSeason)
      } catch (error) {
        console.log("Error checking purchase:", error)
        setHasPurchased(false)
      } finally {
        setIsLoading(false)
      }
    }

    checkPurchase()
  }, [season?.id])

  const handleAddToCart = async () => {
    if (!season.product_variant || !season.product_variant.id) return

    const variantId = season.product_variant.id
    if (!variantId) return

    setIsAddingToCart(true)
    try {
      // Check if this season is already in the cart
      const isSeasonInCart = cart?.items?.some((item) => {
        return item.variant_id === variantId
      })

      if (isSeasonInCart) {
        console.log("Season already in cart, opening payment popup")
        setIsPaymentPopupOpen(true)
      } else {
        await addToStreamCart({
          variantId,
          quantity: 1,
          countryCode: "us",
        })

        const updatedCart = await retrieveStreamCart()
        setCart(updatedCart)

        setIsPaymentPopupOpen(true)
      }
    } catch (error) {
      console.error("Error adding to cart:", error)
    } finally {
      setIsAddingToCart(false)
    }
  }

  return (
    <div className="bg-black min-h-screen">
      {/* Hero Banner */}
      <div className="relative h-[60vh] w-full overflow-hidden">
        <Image
          src="/assets/preview.png"
          alt={season.name}
          fill
          className="object-cover object-center brightness-75"
          priority
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-90"></div>

        {/* Content overlay */}
        <div className="absolute bottom-0 left-0 p-12 w-full z-10">
          <div className="max-w-3xl">
            <div className="animate-fade-in">
              <h1 className="text-white text-5xl font-bold mb-4">
                {season.name}
              </h1>
              <p className="text-white/90 text-xl mb-6">
                {season?.description || "Watch all episodes from this season"}
              </p>

              <div className="flex flex-wrap gap-x-6 gap-y-2 text-white/70 text-sm mb-6">
                <div className="flex items-center">
                  <span className="mr-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 4v16M17 4v16M3 8h18M3 16h18"
                      />
                    </svg>
                  </span>
                  {count} Episodes
                </div>

                {!hasPurchased && cheapestPrice && (
                  <div className="flex items-center">
                    <span className="mr-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </span>
                    <>
                      {cheapestPrice.price_type === "sale" && (
                        <Text
                          className="line-through text-white/70 font-bold"
                          data-testid="original-price"
                        >
                          {cheapestPrice.original_price}
                        </Text>
                      )}
                      <Text
                        className={clx("text-white/70 font-bold", {
                          "text-ui-fg-interactive":
                            cheapestPrice.price_type === "sale",
                        })}
                        data-testid="price"
                      >
                        {cheapestPrice.calculated_price}
                      </Text>
                    </>{" "}
                  </div>
                )}
                {!hasPurchased ? (
                  <div className="flex items-center">
                    <Button
                      variant="secondary"
                      className="bg-dark-green/20 hover:bg-light-green/30 text-white border-0"
                      onClick={handleAddToCart}
                      disabled={isAddingToCart}
                    >
                      {isAddingToCart ? "Adding..." : "Buy Now"}
                    </Button>
                  </div>
                ) : (
                  <span className="text-green-500 text-xs font-medium">
                    Purchased
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Episodes List */}
      <div className="py-12 px-6 md:px-12">
        <h2 className="text-3xl font-bold text-white mb-8">Episodes</h2>
        {episodes.length > 0 ? (
          <EpisodesList
            products={episodes}
            season_handle={season.handle}
            region={region}
          />
        ) : (
          <div className="text-center py-12 text-white/70">
            <p>No episodes available yet.</p>
          </div>
        )}
      </div>

      {/* Payment Popup */}
      {cart && (
        <EpisodePaymentPopup
          cart={cart}
          availablePaymentMethods={availablePaymentMethods}
          availableShippingMethods={availableShippingMethods}
          isOpen={isPaymentPopupOpen}
          onClose={() => setIsPaymentPopupOpen(false)}
        />
      )}
    </div>
  )
}
