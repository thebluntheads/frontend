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
import { useTranslations, useLocale } from "next-intl"
import LanguageSelect from "@modules/layout/components/language-select"
import MuxVideoPlayer from "@modules/common/components/mux-player"
import MuxPlayerAdsWrapper from "@modules/common/components/mux-player-ads-wrapper"
import Spinner from "@modules/common/icons/spinner"
import { useCustomer } from "@lib/hooks/use-customer"

interface EpisodeTemplateProps {
  episode: DigitalProduct | null
  season: DigitalProduct | null
}

export default function EpisodeTemplate({
  episode,
  season,
}: EpisodeTemplateProps) {
  const t = useTranslations()
  const locale = useLocale()
  const { customer } = useCustomer()
  const [visitorId, setVisitorId] = useState<string>("")

  const [cart, setCart] = useState<StoreCart | null>(null)
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
  const [muxPlaybackId, setMuxPlaybackId] = useState<string | null>(null)
  const [muxJwt, setMuxJwt] = useState<string | null>(null)

  // Generate a unique visitor ID using browser fingerprinting and store in localStorage
  useEffect(() => {
    // Function to generate a simple fingerprint based on browser information
    const generateBrowserFingerprint = () => {
      if (typeof window === "undefined") return "visitor"

      const nav = window.navigator
      const screen = window.screen

      // Combine various browser properties to create a unique identifier
      const fingerprint = [
        nav.userAgent,
        nav.language,
        screen.colorDepth,
        screen.width + "x" + screen.height,
        new Date().getTimezoneOffset(),
        nav.platform,
        !!nav.cookieEnabled,
      ].join("|")

      // Create a simple hash from the fingerprint string
      let hash = 0
      for (let i = 0; i < fingerprint.length; i++) {
        hash = (hash << 5) - hash + fingerprint.charCodeAt(i)
        hash = hash & hash // Convert to 32bit integer
      }

      // Return a positive hex string
      return "visitor-" + Math.abs(hash).toString(16)
    }

    // Check if we already have a visitor ID in localStorage
    if (typeof window !== "undefined") {
      const storedVisitorId = localStorage.getItem("mux_visitor_id")

      if (storedVisitorId) {
        setVisitorId(storedVisitorId)
      } else {
        // Generate new ID and store it
        const newVisitorId = generateBrowserFingerprint()
        localStorage.setItem("mux_visitor_id", newVisitorId)
        setVisitorId(newVisitorId)
      }
    }
  }, [])

  // Get fallback localized video URL from translations
  const localizedEpisodeVideoUrl = t("media.videos.episode")

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
          parent_id,
          "episode",
          locale
        )

        const hasPurchasedEpisode = digitalProduct?.id === product_id
        setHasPurchased(hasPurchasedEpisode)

        // The backend now handles locale-specific playback ID selection
        // and returns it directly in digitalProduct.muxPlaybackId

        if (digitalProduct?.muxPlaybackId) {
          // Use the playback ID that was selected based on locale in the backend
          setMuxPlaybackId(digitalProduct.muxPlaybackId)
          // Also set as video URL for backward compatibility
          setVideoUrl(digitalProduct.muxPlaybackId)
        }

        if (hasPurchasedEpisode && digitalProduct?.muxJwt) {
          // For purchased episodes, use the JWT token generated by the backend
          setMuxJwt(digitalProduct.muxJwt)
        } else if (digitalProduct?.preview_url) {
          // For non-purchased episodes, use the preview URL
          setVideoUrl(digitalProduct.preview_url)
          setMuxPlaybackId(digitalProduct.preview_url)
        } else if (localizedEpisodeVideoUrl) {
          // Fallback to localized URL from translations
          setVideoUrl(localizedEpisodeVideoUrl)
          setMuxPlaybackId(localizedEpisodeVideoUrl)
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
      } catch (error) {
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
        setIsPaymentPopupOpen(true)
      } else {
        await addToStreamCart({
          variantId,
          quantity: 1,
          countryCode: "us",
        })

        const updatedCart = await retrieveStreamCart()
        setCart(updatedCart)

        setIsPaymentPopupOpen(Number(updatedCart?.items?.length) > 0)
      }
    } catch (error) {
      console.error("Error adding to cart:", error)
    } finally {
      setIsAddingToCart(false)
    }
  }

  // Use the variant metadata thumbnailUrl if available, otherwise fall back to default images
  const bannerUrl = episode?.product_variant?.metadata?.thumbnailUrl
    ? (episode.product_variant.metadata.thumbnailUrl as string)
    : episode?.name.includes("1")
    ? "/assets/episode_one_thumbnail.png"
    : "/assets/preview.png"

  if (!episode || !season) {
    notFound()
  }

  return (
    <div className="bg-black min-h-screen">
      {hasPurchased ? (
        muxPlaybackId ? (
          <div className="relative w-full h-[80vh] bg-black">
            {/* Language selector for video */}
            <div className="absolute top-4 right-4 z-30">
              <LanguageSelect minimal={true} showVideoText={true} />
            </div>

            <MuxPlayerAdsWrapper
              playbackId={muxPlaybackId || ""}
              thumbnailUrl={bannerUrl || "/assets/preview.png"}
              alt={episode.name}
              jwt={muxJwt || undefined}
              className="w-full h-full"
              autoPlay={false}
              customerId={customer?.id || visitorId}
              videoTitle={episode.name}
              // Only show ads for non-purchased episodes
              enableAds={!hasPurchased}
              // adTagUrl={t("media.ads.episode_ad_tag", {
              //   fallback:
              //     "https://pubads.g.doubleclick.net/gampad/ads?iu=/21775744923/external/single_ad_samples&sz=640x480&cust_params=sample_ct%3Dlinear&ciu_szs=300x250%2C728x90&gdfp_req=1&output=vast&unviewed_position_start=1&env=vp&impl=s&correlator=",
              // })}
            />
          </div>
        ) : videoUrl ? (
          <Hero
            title={episode.name}
            description={""}
            ctaText={
              episode?.product_variant?.metadata?.unlocked
                ? "Watch Now 🔓"
                : "Unlocks Soon 🔒"
            }
            ctaLink="#"
            thumbnailUrl={bannerUrl}
            isEpisodePage={true}
          />
        ) : (
          <div className="flex items-center justify-center h-[80vh] bg-black">
            <Spinner />
          </div>
        )
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
                      className="bg-dark-green text-white border-0"
                      disabled
                    >
                      Loading...
                    </Button>
                  ) : hasPurchased ? (
                    <Button
                      variant="secondary"
                      className="bg-dark-green hover:bg-light-green text-white border-0"
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
                        className="bg-dark-green hover:bg-light-green text-white border-0"
                        onClick={handleAddToCart}
                        disabled={isAddingToCart}
                      >
                        {isAddingToCart ? "Processing..." : "Buy Episode"}
                      </Button>
                      {"or"}
                      <Button
                        variant="secondary"
                        className="bg-dark-green hover:bg-light-green text-white border-0"
                        onClick={() =>
                          (window.location.href = "/seasons/season-1")
                        }
                      >
                        {isAddingToCart ? "Processing..." : "Buy Full Season 1"}
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
      {Number(cart?.items?.length) > 0 && (
        <EpisodePaymentPopup
          cart={cart!}
          availablePaymentMethods={availablePaymentMethods}
          availableShippingMethods={availableShippingMethods}
          isOpen={isPaymentPopupOpen}
          onClose={() => setIsPaymentPopupOpen(false)}
        />
      )}
    </div>
  )
}
