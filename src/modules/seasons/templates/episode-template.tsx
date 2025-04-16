"use client"

import { useState, useEffect } from "react"
import { StoreCart, StoreCartShippingOption } from "@medusajs/types"
import Image from "next/image"
import { Button } from "@medusajs/ui"
import { getDigitalProductPrice } from "@lib/util/get-product-price"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { notFound } from "next/navigation"
import React from "react"
import { Text, clx } from "@medusajs/ui"
import {
  getCustomerDigitalProducts,
  listSeasonsEpisodes,
} from "@lib/data/digital-products"
import EpisodePaymentPopup from "../components/episode-payment-popup"
import { listCartPaymentMethods } from "@lib/data/payment"
import {
  addToStreamCart,
  listStreamCartOptions,
  placeDigitalProductOrder,
  retrieveStreamCart,
} from "@lib/data/digital-cart"
import Hero from "@modules/home/components/hero"
import { DigitalProduct } from "types/global"
import EnhancedEpisodeDetails from "../components/enhanced-episode-details"

interface EpisodeTemplateProps {
  episode: DigitalProduct | null
  season: DigitalProduct | null
}

export default function EpisodeTemplate({
  episode,
  season,
}: EpisodeTemplateProps) {
  const [cart, setCart] = useState<StoreCart | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const [hasPurchased, setHasPurchased] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isAddingToCart, setIsAddingToCart] = useState<boolean>(false)
  const [isPaymentPopupOpen, setIsPaymentPopupOpen] = useState<boolean>(false)
  const [availablePaymentMethods, setAvailablePaymentMethods] = useState<any[]>(
    []
  )
  const [availableShippingMethods, setAvailableShippingMethods] = useState<
    StoreCartShippingOption[]
  >([])

  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [relatedEpisodes, setRelatedEpisodes] = useState<DigitalProduct[]>([])

  const handlePlayVideo = () => {
    if (videoUrl) {
      window.location.href = videoUrl
    }
  }

  const { cheapestPrice } = getDigitalProductPrice({
    variant: episode?.product_variant,
  })

  useEffect(() => {
    const getCart = async () => {
      const cartData = await retrieveStreamCart()
      setCart(cartData)
    }

    getCart()
  }, [])

  useEffect(() => {
    const fetchPaymentAndShippingMethods = async () => {
      try {
        if (cart?.region?.id) {
          const paymentMethods = await listCartPaymentMethods(cart.region.id)
          if (paymentMethods) {
            setAvailablePaymentMethods(paymentMethods)
          }
          const cartOptions = await listStreamCartOptions()
          if (cartOptions?.shipping_options) {
            setAvailableShippingMethods(cartOptions.shipping_options)
          }
        }
      } catch (error) {
        console.error("Error fetching payment or shipping methods:", error)
      }
    }

    if (cart) {
      fetchPaymentAndShippingMethods()
    }
  }, [cart])

  useEffect(() => {
    const checkPurchase = async () => {
      try {
        const product_id = episode?.id
        const parent_id = episode?.parent_id!
        const digitalProduct = await getCustomerDigitalProducts(
          product_id,
          parent_id
        )

        console.log({ digitalProduct })
        const hasPurchasedEpisode = digitalProduct?.id === product_id
        setHasPurchased(hasPurchasedEpisode)

        if (hasPurchasedEpisode) {
          setVideoUrl(digitalProduct.content_url!)
        } else {
          setVideoUrl(digitalProduct.preview_url!)
        }

        // Fetch related episodes from the same season
        if (parent_id) {
          const { digital_products } = await listSeasonsEpisodes({}, parent_id)
          // Filter out the current episode and limit to 4 episodes
          const filteredEpisodes = digital_products
            .filter((ep) => ep.id !== product_id)
            .slice(0, 4)
          setRelatedEpisodes(filteredEpisodes)
        }

        console.log("Has purchased:", hasPurchasedEpisode)
      } catch (error) {
        console.log("Error checking purchase:", error)
        setHasPurchased(false)
      } finally {
        setIsLoading(false)
      }
    }

    checkPurchase()
  }, [episode?.id])

  const handleAddToCart = async () => {
    if (!episode?.product_variant || !episode?.product_variant.id) return

    const variantId = episode.product_variant?.id
    if (!variantId) return

    setIsAddingToCart(true)
    try {
      // Check if this episode is already in the cart
      const isEpisodeInCart = cart?.items?.some((item) => {
        return item.variant_id === variantId
      })

      if (isEpisodeInCart) {
        console.log("Episode already in cart, opening payment popup")
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

  const bannerUrl = "/assets/preview.png"

  if (!episode || !season) {
    notFound()
  }

  return (
    <div className="bg-black min-h-screen">
      {hasPurchased && videoUrl ? (
        <Hero
          title={episode.name}
          description={""}
          ctaText="Watch Now"
          ctaLink="#"
          thumbnailUrl={bannerUrl}
          videoUrl={videoUrl}
        />
      ) : (
        <div className="relative h-[80vh] w-full overflow-hidden">
          <Image
            src={bannerUrl}
            alt={episode.name}
            fill
            className="object-cover object-center brightness-75"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-90"></div>

          {/* Content overlay for non-purchased episodes */}
          <div className="absolute bottom-0 left-0 p-12 w-full z-10">
            <div className="max-w-3xl">
              <div className="animate-fade-in">
                <div className="flex items-center mb-4">
                  <LocalizedClientLink
                    href={`/seasons/${season.handle}`}
                    className="text-white/70 hover:text-white text-sm flex items-center transition-colors"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                    Back to {season.name}
                  </LocalizedClientLink>
                </div>

                <h1 className="text-white text-5xl font-bold mb-4">
                  {episode.name}
                </h1>

                {/* Episode metadata */}
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
                    {episode.name}
                  </div>

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
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </span>
                    {episode?.product_variant?.metadata?.duration as string}
                  </div>

                  {cheapestPrice && (
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
                </div>
                {/* Action buttons */}
                <div className="flex flex-wrap gap-4 mt-8">
                  {isLoading ? (
                    <Button
                      variant="secondary"
                      className="bg-black/10 text-white border-0"
                      disabled
                    >
                      Loading...
                    </Button>
                  ) : hasPurchased ? (
                    <Button
                      variant="secondary"
                      className="bg-black/20 hover:bg-black/30 text-white border-0"
                      onClick={handlePlayVideo}
                    >
                      Watch Full Episode
                    </Button>
                  ) : (
                    <>
                      {/* {metadata?.preview_url && (
                        <Button
                          variant="secondary"
                          className="bg-black/10 hover:bg-black/20 text-white border-0"
                        >
                          Watch Preview
                        </Button>
                      )} */}
                      <Button
                        variant="secondary"
                        className="bg-dark-green/20 hover:bg-light-green/30 text-white border-0"
                        onClick={handleAddToCart}
                        disabled={isAddingToCart}
                      >
                        {isAddingToCart ? "Adding..." : "Buy Episode"}
                      </Button>
                      <Button
                        variant="secondary"
                        className="bg-dark-green/20 hover:bg-light-green/30 text-white border-0"
                        onClick={() => (window.location.href = "/season-1")}
                      >
                        {isAddingToCart ? "Adding..." : "Buy Full Season 1"}
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Episode Details */}
      <EnhancedEpisodeDetails
        episode={episode}
        season={season}
        relatedEpisodes={relatedEpisodes}
        hasPurchased={hasPurchased}
      />

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
