"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { DigitalProduct } from "types/global"
import Image from "next/image"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../../../components/ui/tabs"
import { Button } from "../../../../components/ui/button"
import { AudioWave, PlayButton } from "../../../../components/ui/audio-wave"
import AudioPlayer from "../../../../components/ui/audio-player"
import {
  listSounds,
  getCustomerDigitalProducts,
  listAlbums,
} from "@lib/data/digital-products"
import {
  addToStreamCart,
  retrieveStreamCart,
  placeDigitalProductOrder,
  listStreamCartOptions,
  updateStreamCart,
  setStreamShippingMethod,
} from "@lib/data/digital-cart"
import { getDigitalProductPrice } from "@lib/util/get-product-price"
import { StoreCartShippingOption } from "@medusajs/types"
import { isAuthorizeNet as isAuthorizeNetFunc } from "@lib/constants"
import AuthorizeNetPayment, {
  AuthorizeNetCardInfo,
} from "@modules/common/components/authorize-net-payment"
import { useCustomer } from "@lib/hooks/use-customer"
import { useAcceptJs } from "react-acceptjs"
import { initiatePaymentSession } from "@lib/data/cart"

const authData = {
  apiLoginID: process.env.NEXT_PUBLIC_AUTHORIZE_NET_LOGIN_ID || "",
  clientKey: process.env.NEXT_PUBLIC_AUTHORIZE_NET_CLIENT_KEY || "",
}

type WalletPaymentType = "apple-pay" | "google-pay" | null

export default function SoundsPage() {
  const { customer, isLoading: isLoadingCustomer } = useCustomer()
  const [isRedirecting, setIsRedirecting] = useState(false)

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoadingCustomer && !customer && !isRedirecting) {
      setIsRedirecting(true)
      window.location.href = "/account"
    }
  }, [customer, isLoadingCustomer, isRedirecting])
  const [sounds, setSounds] = useState<DigitalProduct[]>([])
  const [albums, setAlbums] = useState<DigitalProduct[]>([])
  const [activeAlbumId, setActiveAlbumId] = useState<string | null>(null)
  const [albumTracks, setAlbumTracks] = useState<
    Record<string, DigitalProduct[]>
  >({})
  const [isLoading, setIsLoading] = useState(true)
  const [playingTrackId, setPlayingTrackId] = useState<string | null>(null)
  const [currentAudioSrc, setCurrentAudioSrc] = useState<string>("")
  const [audioProgress, setAudioProgress] = useState(0)
  const [purchasedSounds, setPurchasedSounds] = useState<
    Record<string, boolean>
  >({})
  const [purchasedAlbums, setPurchasedAlbums] = useState<
    Record<string, boolean>
  >({})
  const [purchasedContentUrl, setPurchasedContentUrl] = useState<
    Record<string, string>
  >({})
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [cart, setCart] = useState<any>(null)
  const [isPaymentPopupOpen, setIsPaymentPopupOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [availableShippingMethods, setAvailableShippingMethods] = useState<
    StoreCartShippingOption[]
  >([])
  const [enlargedAlbumCover, setEnlargedAlbumCover] = useState<string | null>(
    null
  )
  const [paymentData, setPaymentData] =
    useState<google.payments.api.PaymentData>()

  const activeSession = cart?.payment_collection?.payment_sessions?.find(
    (paymentSession: any) => paymentSession.status === "pending"
  )

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(
    activeSession?.provider_id ?? "pp_authorize-net_authorize-net"
  )
  const [currentSound, setCurrentSound] = useState<DigitalProduct | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [cardData, setCardData] = useState<AuthorizeNetCardInfo>({
    cardNumber: "",
    expiration: "",
    cardCode: "",
    fullName: "",
  })
  const [walletPaymentType, setWalletPaymentType] =
    useState<WalletPaymentType>(null)

  // Custom handler for card data to ensure spaces are properly handled
  const handleCardDataChange = (data: Partial<AuthorizeNetCardInfo>) => {
    setCardData((prevData) => ({
      ...prevData,
      ...data,
    }))
  }

  const {
    dispatchData,
    loading,
    error: err,
  } = useAcceptJs({ environment: "PRODUCTION", authData })
  const [month, year] = cardData.expiration.split("/")

  // Form data for customer information
  const [formData, setFormData] = useState<Record<string, string>>({
    email: "",
    "shipping_address.first_name": "",
    "shipping_address.last_name": "",
    "shipping_address.country_code": "us",
  })

  // Get customer information if available
  useEffect(() => {
    if (customer) {
      setFormData({
        email: customer.email || "",
        "shipping_address.first_name": customer.first_name || "",
        "shipping_address.last_name": customer.last_name || "",
        "shipping_address.country_code":
          customer.billing_address?.country_code || "us",
      })
    }
  }, [customer])

  useEffect(() => {
    const fetchAlbums = async () => {
      try {
        setIsLoading(true)
        const { digital_products: albumsData } = await listAlbums()
        if (!albumsData || albumsData.length === 0) {
          setAlbums([
            {
              id: "singles",
              name: "Singles",
              position: "",
              content_url: "",
              preview_url: "",
              description: "",
              handle: "",
              parent_id: null,
              type: "album",
              //@ts-ignore
              product_variant: {},
            },
          ])
          return
        }

        setAlbums(albumsData)
        setActiveAlbumId(albumsData[0]?.id) // Set default active tab
      } catch (error) {
        console.error("Error fetching albums:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchAlbums()
  }, [])

  useEffect(() => {
    const fetchSoundsByAlbum = async () => {
      if (!activeAlbumId || albumTracks[activeAlbumId]) return

      try {
        const { digital_products } = await listSounds({}, activeAlbumId)
        if (digital_products) {
          setSounds(digital_products)

          setAlbumTracks((prev) => ({
            ...prev,
            [activeAlbumId]: digital_products,
          }))
        }
      } catch (error) {
        console.error("Error fetching sounds:", error)
      }
    }

    fetchSoundsByAlbum()
  }, [activeAlbumId])

  // Use a ref to track if we're currently switching tracks to prevent rapid state changes
  const isChangingTrack = useRef(false)

  useEffect(() => {
    const checkPurchases = async () => {
      try {
        // Create a map to store purchase status for each sound
        const purchaseAlbumStatus: Record<string, boolean> = {}

        // Check purchase status for each sound
        for (const album of albums) {
          try {
            const digitalProduct = await getCustomerDigitalProducts(album.id)
            purchaseAlbumStatus[album.id] = !!digitalProduct?.id
          } catch (error) {
            console.log(`Error checking purchase for sound ${album.id}:`, error)
            purchaseAlbumStatus[album.id] = false
          }
        }

        setPurchasedAlbums(purchaseAlbumStatus)
      } catch (error) {
        console.log("Error checking purchases:", error)
      }
    }

    if (albums.length > 0) {
      checkPurchases()
    }
  }, [albums])

  // Check if user has purchased sounds
  useEffect(() => {
    const checkPurchases = async () => {
      try {
        // Create a map to store purchase status for each sound
        const purchaseStatus: Record<string, boolean> = {}

        // Check purchase status for each sound
        for (const sound of sounds) {
          try {
            const digitalProduct = await getCustomerDigitalProducts(
              sound.id,
              sound?.parent_id!
            )
            purchaseStatus[sound.id] = !!digitalProduct?.id
            purchasedContentUrl[sound.id] = digitalProduct.content_url!
          } catch (error) {
            console.log(`Error checking purchase for sound ${sound.id}:`, error)
            purchaseStatus[sound.id] = false
            purchasedContentUrl[sound.id] = ""
          }
        }

        setPurchasedSounds(purchaseStatus)
        setPurchasedContentUrl(purchasedContentUrl)
      } catch (error) {
        console.log("Error checking purchases:", error)
      }
    }

    if (sounds.length > 0) {
      checkPurchases()
    }
  }, [sounds])

  // Fetch cart on component mount
  useEffect(() => {
    const fetchCart = async () => {
      try {
        const cartData = await retrieveStreamCart()
        setCart(cartData)
      } catch (error) {
        console.error("Error fetching cart:", error)
      }
    }

    fetchCart()
  }, [])

  // Fetch payment and shipping methods when cart is available
  useEffect(() => {
    const fetchPaymentAndShippingMethods = async () => {
      try {
        // Get available shipping options
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

  // Handle adding a sound to the cart
  const handleAddToCart = async (sound: DigitalProduct) => {
    if (!sound?.product_variant || !sound?.product_variant.id) {
      console.error("No product variant found for sound:", sound)
      return
    }

    // Check if user is logged in
    if (!customer) {
      // Get the country code from the pathname
      const pathSegments = window.location.pathname.split("/")
      const countryCode = pathSegments[1] || "us"

      // Redirect to login page with return URL
      window.location.href = `/${countryCode}/account?redirect=${encodeURIComponent(
        window.location.pathname
      )}`
      return
    }

    setCurrentSound(sound)
    const variantId = sound.product_variant.id
    setIsAddingToCart(true)

    try {
      // Check if this sound is already in the cart
      const isSoundInCart = cart?.items?.some((item: any) => {
        return item.variant_id === variantId
      })

      if (isSoundInCart) {
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

  const handleApplePay = async () => {
    try {
      // Check if Apple Pay is available
      if (
        !window.ApplePaySession ||
        !window.ApplePaySession.canMakePayments()
      ) {
        throw new Error("Apple Pay is not available on this device or browser")
      }

      // Configure the payment request
      const paymentRequest = {
        countryCode: "US",
        currencyCode: "USD",
        supportedNetworks: ["visa", "masterCard", "amex", "discover"],
        merchantCapabilities: [
          "supports3DS",
          "supportsCredit",
          "supportsDebit",
        ],
        requiredBillingContactFields: ["postalAddress", "email", "phone"],
        total: {
          label: "The Blunt Heads",
          amount: cart.total.toFixed(2),
        },
      }

      // Create an Apple Pay session
      const session = new window.ApplePaySession(3, paymentRequest)
      // Handle payment authorization
      return new Promise<{ token: string; billing_address: any }>(
        (resolve, reject) => {
          session.onvalidatemerchant = async (event: any) => {
            try {
              // Call your backend to validate the merchant with Apple's validation URL
              const response = await fetch("/api/apple-pay/validate-merchant", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  validationURL: event.validationURL,
                }),
              })

              if (!response.ok) {
                const errorText = await response.text()
                throw new Error(`Merchant validation failed: ${errorText}`)
              }

              const merchantSession = await response.json()

              // Complete merchant validation with the session from Apple
              session.completeMerchantValidation(merchantSession)
            } catch (error) {
              console.error("Merchant validation failed:", error)
              session.abort()
              reject(error as Error)
            }
          }

          session.onpaymentauthorized = async (event: any) => {
            try {
              // Get the payment data from the event
              const token = event.payment.token.paymentData
              const base64 = window.btoa(JSON.stringify(token))
              const billingContact = event.payment.billingContact

              // Complete the payment
              session.completePayment(window.ApplePaySession.STATUS_SUCCESS)

              const billing_address = billingContact
                ? billingContact
                : cart?.billing_address

              // Return the token for processing with Authorize.Net
              resolve({
                token: base64,
                billing_address: billing_address,
              })
            } catch (error) {
              console.error("Payment authorization failed:", error)
              session.completePayment(window.ApplePaySession.STATUS_FAILURE)
              reject(error as Error)
            }
          }

          session.oncancel = () => {
            reject(new Error("Apple Pay payment was canceled"))
          }

          // Start the session
          session.begin()
        }
      )
    } catch (error) {
      console.error("Apple Pay error:", error)
      throw error
    }
  }

  const handleGooglePay = async () => {
    try {
      const tokenData = paymentData?.paymentMethodData.tokenizationData.token!
      const base64 = window.btoa(tokenData)
      const billingAddress =
        paymentData?.paymentMethodData?.info?.billingAddress

      const billing_address = billingAddress
        ? billingAddress
        : cart?.billing_address

      return {
        token: base64,
        billing_address: billing_address,
      }
    } catch (error) {
      console.error("Google Pay error:", error)
      throw error
    }
  }

  // Handle payment completion
  const handlePaymentComplete = async () => {
    setIsLoading(true)
    setErrorMessage(null)

    try {
      if (walletPaymentType) {
        let walletPaymentData

        if (walletPaymentType === "apple-pay") {
          walletPaymentData = await handleApplePay()

          const payc = await initiatePaymentSession(cart, {
            provider_id: selectedPaymentMethod,
            data: {
              billing_address: walletPaymentData.billing_address,
              customer: cart.customer,
              applePayData: walletPaymentData.token,
            },
          })

          const pendingSession =
            payc?.payment_collection?.payment_sessions?.find(
              (session: any) => session.status === "pending"
            )

          if (pendingSession) {
            setSubmitting(true)
            await placeDigitalProductOrder()
            return
          }
        } else if (walletPaymentType === "google-pay") {
          walletPaymentData = await handleGooglePay()

          const payc = await initiatePaymentSession(cart, {
            provider_id: selectedPaymentMethod,
            data: {
              billing_address: walletPaymentData.billing_address,
              customer: cart.customer,
              googlePayData: walletPaymentData?.token!,
            },
          })

          const pendingSession =
            payc?.payment_collection?.payment_sessions?.find(
              (session: any) => session.status === "pending"
            )

          if (pendingSession) {
            setSubmitting(true)
            await placeDigitalProductOrder()
            return
          }
        }

        // Handle unexpected session state
        setErrorMessage(
          "Digital wallet payment session initiation failed. Please try again."
        )
        return
      }

      if (cardData.cardNumber) {
        // Step 1: Send card data to Authorize.Net
        const transactionResponse = await dispatchData({
          cardData: {
            cardNumber: cardData.cardNumber.replace(/\s+/g, ""),
            month,
            year,
            cardCode: cardData.cardCode,
            fullName: cardData.fullName, // Include full name in the dispatch
          },
        })
        // Handle transaction errors
        if (transactionResponse?.messages?.resultCode === "Error") {
          const errorText =
            transactionResponse.messages.message[0]?.text || "Payment failed"
          setErrorMessage(errorText)
          return
        }

        // Step 2: Initiate payment session with opaque data
        if (transactionResponse?.messages?.resultCode === "Ok") {
          const opaqueData = transactionResponse.opaqueData.dataValue
          const payc = await initiatePaymentSession(cart, {
            provider_id: selectedPaymentMethod,
            data: {
              billing_address: cart.billing_address,
              customer: cart.customer,
              opaqueData,
              fullName: cardData.fullName, // Include full name in payment session data
            },
          })

          // Handle successful payment initiation
          const pendingSession =
            payc?.payment_collection?.payment_sessions?.find(
              (session: any) => session.status === "pending"
            )

          if (pendingSession) {
            setSubmitting(true)
            await placeDigitalProductOrder()
            return
          }

          // Handle unexpected session state
          setErrorMessage(
            "Payment session initiation failed. Please try again."
          )
        }
      }

      const checkActiveSession =
        activeSession?.provider_id === selectedPaymentMethod

      if (!checkActiveSession) {
        await initiatePaymentSession(cart, {
          provider_id: selectedPaymentMethod,
        })
      }
    } catch (err: any) {
      console.log(err)
      const msg = err?.messages?.message?.[0]?.text || err.message
      setErrorMessage(msg)
    } finally {
      setIsLoading(false)
    }
  }

  const togglePlay = async (trackId: string) => {
    // Prevent rapid toggling that can cause AbortError
    if (isChangingTrack.current) {
      return
    }

    isChangingTrack.current = true

    try {
      const track = sounds.find((sound) => sound.id === trackId)
      if (!track) {
        return
      }

      if (playingTrackId === trackId) {
        setPlayingTrackId(null)
        setCurrentAudioSrc("")
        setAudioProgress(0) // Reset progress
      } else {
        // If another track is playing, stop it first
        if (playingTrackId) {
          setPlayingTrackId(null)
          setCurrentAudioSrc("")

          // Small delay to ensure the previous audio is properly stopped
          await new Promise((resolve) => setTimeout(resolve, 50))
        }

        // Check if the album is purchased first
        const albumId = track.parent_id
        const isAlbumPurchased = albumId && purchasedAlbums[albumId]

        // Check if individual track is purchased
        const isTrackPurchased = purchasedSounds[trackId]

        // Determine which URL to use based on purchase status
        let audioUrl

        if (isAlbumPurchased || isTrackPurchased) {
          // If album or track is purchased, use content_url
          audioUrl = purchasedContentUrl[trackId]
        } else {
          // Otherwise use preview_url
          audioUrl = track.preview_url
        }

        if (!audioUrl) {
          return
        }

        // Set the source first, then set the playing track ID
        setCurrentAudioSrc(audioUrl)

        // Small delay to ensure the audio source is set before playing
        await new Promise((resolve) => setTimeout(resolve, 50))

        setPlayingTrackId(trackId)
      }
    } catch (error) {
      console.error("Error toggling playback:", error)
    } finally {
      // Allow track changes again
      setTimeout(() => {
        isChangingTrack.current = false
      }, 300) // Add a small debounce to prevent rapid toggling
    }
  }

  const handleAudioEnded = () => {
    setPlayingTrackId(null)
    setCurrentAudioSrc("")
    setAudioProgress(0) // Reset progress
  }

  // Debug function to track progress
  const handleProgress = (progress: number) => {
    setAudioProgress(progress)
  }

  const shippingMethod = useMemo(() => {
    return availableShippingMethods?.filter((sm) => sm.amount === 0)[0]
  }, [availableShippingMethods])

  // Auto-save address data when component loads
  useEffect(() => {
    const saveAddressData = async () => {
      if (!cart?.shipping_address) {
        setIsLoading(true)
        try {
          // Save address to cart
          const data = {
            shipping_address: {
              first_name: formData["shipping_address.first_name"],
              last_name: formData["shipping_address.last_name"],
              address_1:
                formData["shipping_address.address_1"] || "Default Address",
              address_2: "",
              //company: formData["shipping_address.company"],
              postal_code: formData["shipping_address.postal_code"] || "00000",
              city: formData["shipping_address.city"] || "Default City",
              country_code: formData["shipping_address.country_code"],
              province: formData["shipping_address.province"],
              phone: formData["shipping_address.phone"],
            },
            email: formData.email,
            billing_address: {
              first_name: formData["shipping_address.first_name"],
              last_name: formData["shipping_address.last_name"],
              address_1:
                formData["shipping_address.address_1"] || "Default Address",
              address_2: "",
              //company: formData["shipping_address.company"],
              postal_code: formData["shipping_address.postal_code"] || "00000",
              city: formData["shipping_address.city"] || "Default City",
              country_code: formData["shipping_address.country_code"],
              province: formData["shipping_address.province"],
              phone: formData["shipping_address.phone"],
            },
          }

          await updateStreamCart(data)
        } catch (err: any) {
          setError(err.message)
        } finally {
          setIsLoading(false)
        }
      }
    }

    const saveShippingOption = async () => {
      if (cart?.shipping_methods?.length === 0) {
        try {
          await setStreamShippingMethod({
            cartId: cart.id,
            shippingMethodId: shippingMethod.id,
          })
        } catch (err: any) {
          setError(err.message)
        } finally {
          setIsLoading(false)
        }
      }
    }

    if (isPaymentPopupOpen) {
      saveAddressData()
      saveShippingOption()
    }
  }, [cart?.id, isPaymentPopupOpen])

  if (isLoading) {
    return (
      <div className="bg-black min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-dark-green border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-white text-lg">Loading sounds...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-black min-h-screen">
      {/* Audio player (hidden) */}
      {currentAudioSrc && (
        <AudioPlayer
          src={currentAudioSrc}
          isPlaying={!!playingTrackId}
          onEnded={handleAudioEnded}
          onProgress={handleProgress}
        />
      )}

      {/* Elegant sound browser header with waveform */}
      <div className="w-full bg-black py-10">
        <div className="w-full px-3 sm:px-4 md:px-6">
          <div className="flex flex-col items-center justify-center text-center mb-4 sm:mb-6">
            <div className="w-full relative">
              {/* Animated waveform background */}
              <div className="absolute inset-0 flex items-center justify-center opacity-20">
                <div className="w-full h-20 flex items-center justify-center gap-1">
                  {Array.from({ length: 50 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-full w-1 bg-dark-green rounded-full"
                      style={{
                        height: `${Math.sin(i * 0.2) * 50 + 50}%`,
                        animationDelay: `${i * 0.05}s`,
                        animation: "pulse 2s infinite",
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Title and description */}
              <div className="relative z-10 py-6 sm:py-8">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-2 sm:mb-3 tracking-tight">
                  <span className="text-dark-green">Blunt</span>Heads Soundtrack
                </h1>
                <p className="text-lg sm:text-xl text-gray-300 max-w-full sm:max-w-2xl mx-auto">
                  All the music from Season 1 in one place.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add animation keyframes */}
      <style jsx global>{`
        @keyframes pulse {
          0%,
          100% {
            transform: scaleY(1);
          }
          50% {
            transform: scaleY(0.7);
          }
        }
      `}</style>

      {/* Main content */}
      <div className="w-full px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8">
        <Tabs
          value={activeAlbumId || ""}
          onValueChange={setActiveAlbumId}
          className="w-full"
        >
          <div className="flex justify-center items-center mb-4 sm:mb-6 md:mb-8 mx-auto max-w-screen-xl lg:max-w-4xl xl:max-w-5xl">
            <TabsList className="bg-gray-900/50 p-1 rounded-lg overflow-x-auto mx-auto">
              {albums.map((album) => (
                <TabsTrigger
                  key={album.id}
                  value={album.id}
                  className="rounded-md px-4 py-2 data-[state=active]:bg-dark-green whitespace-nowrap"
                >
                  {album.name}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {albums.map((album) => (
            <TabsContent
              key={album.id}
              value={album.id}
              className="space-y-6 mx-auto"
            >
              {(albumTracks[album.id] || []).length === 0 ? (
                <p className="text-white text-center">
                  No tracks available for this album.
                </p>
              ) : (
                <div className="bg-gray-900/30 rounded-xl overflow-hidden border border-gray-800 w-full mx-auto max-w-screen-xl lg:max-w-4xl xl:max-w-5xl">
                  {/* Album Info - Only once */}
                  <div className="p-3 sm:p-4 md:p-6 flex flex-col md:flex-row gap-3 sm:gap-4">
                    <div
                      className="w-full md:w-60 lg:w-72 h-40 sm:h-48 md:h-60 lg:h-72 rounded-lg overflow-hidden flex-shrink-0 cursor-pointer transition-transform hover:scale-105"
                      style={{ maxWidth: "100%" }}
                      onClick={() =>
                        setEnlargedAlbumCover("/assets/album-cover.jpeg")
                      }
                    >
                      <Image
                        src="/assets/album-cover.jpeg"
                        alt={album.name}
                        width={300}
                        height={300}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-xl sm:text-2xl font-bold text-white mb-1 sm:mb-2">
                        {album.name}
                      </h2>
                      <p className="text-gray-400 text-sm sm:text-base mb-2 sm:mb-3">
                        {album.description || "No description available."}
                      </p>

                      <div className="flex items-center gap-2 sm:gap-4">
                        <span className="text-gray-400">
                          {albumTracks[album.id].length} tracks
                        </span>
                        {Object.keys(purchasedAlbums).length &&
                        Object.values(purchasedAlbums).filter((ps) => !ps)
                          .length ? (
                          <>
                            <span className="text-gray-400">
                              {album.product_variant && (
                                <span className="text-white font-large text-medium">
                                  {getDigitalProductPrice({
                                    variant: album.product_variant,
                                  }).cheapestPrice?.calculated_price || "$1.99"}
                                </span>
                              )}
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleAddToCart(album)}
                              disabled={isAddingToCart}
                              className="text-xs bg-dark-green hover:bg-dark-green text-white px-3 py-1 h-8"
                            >
                              {isAddingToCart ? "Processing..." : "Buy"}
                            </Button>
                          </>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="text-green-500 text-xs font-medium">
                              Purchased
                            </span>
                            {/* <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDownloadAlbum(album.id)}
                              disabled={isDownloading[`album_${album.id}`]}
                              className="text-xs bg-green-600 hover:bg-green-700 text-white px-3 py-1 h-8"
                            >
                              {isDownloading[`album_${album.id}`]
                                ? "..."
                                : "Download All"}
                            </Button> */}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Track List */}
                  <div className="border-t border-gray-800">
                    <div className="p-3 sm:p-4 flex justify-between text-gray-400 text-xs sm:text-sm uppercase font-medium">
                      <div className="flex items-center gap-2 sm:gap-4">
                        <span className="w-8 sm:w-10"></span>
                        <span className="w-6 sm:w-8 text-center hidden sm:inline">
                          #
                        </span>
                        <span>Title</span>
                      </div>
                      <div className="flex items-center gap-2 sm:gap-4">
                        <span className="w-14 sm:w-16 text-right hidden sm:inline">
                          Duration
                        </span>
                        {Object.values(purchasedAlbums)?.filter((ps) => !ps)
                          .length !== 0 && (
                          <>
                            <span className="w-16 sm:w-20 text-right">
                              Price
                            </span>
                            <span className="w-16 sm:w-20 text-right">
                              Action
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="divide-y divide-gray-800/50">
                      {albumTracks[album.id].map((track, index) => (
                        <div
                          key={track.id}
                          className="p-3 sm:p-4 flex justify-between items-center hover:bg-gray-800/30 transition-colors group relative"
                        >
                          {playingTrackId === track.id && (
                            <div className="absolute left-0 top-0 bottom-0 w-full h-full bg-dark-green/10 z-0"></div>
                          )}

                          {/* Progress bar at the bottom of the track */}
                          {playingTrackId === track.id && (
                            <div
                              className="absolute left-0 bottom-0 h-2 bg-dark-green z-10"
                              style={{
                                width: `${audioProgress * 100}%`,
                                transition: "width 0.1s linear",
                              }}
                            ></div>
                          )}
                          <div className="flex items-center gap-2 sm:gap-4 relative z-10">
                            <PlayButton
                              isPlaying={playingTrackId === track.id}
                              onClick={() => togglePlay(track.id)}
                              className="opacity-100 bg-dark-green hover:bg-dark-green w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0"
                            />
                            <div className="w-6 sm:w-8 justify-center items-center hidden sm:flex">
                              <span className="text-center text-gray-500">
                                {index + 1}
                              </span>
                            </div>
                            <div className="max-w-[180px] sm:max-w-full overflow-hidden">
                              <h4 className="text-white font-medium text-sm sm:text-base truncate">
                                {track.name}
                              </h4>
                              <p className="text-gray-500 text-xs sm:text-sm truncate">
                                {(track?.product_variant?.metadata
                                  ?.artist as string) || "TheBluntHeads"}
                              </p>
                            </div>
                          </div>
                          {Object.values(purchasedAlbums).filter((ps) => !ps)
                            .length !== 0 && (
                            <div className="w-16 sm:w-20 text-right">
                              {track.product_variant && (
                                <span className="text-dark-green font-medium text-xs">
                                  {getDigitalProductPrice({
                                    variant: track.product_variant,
                                  }).cheapestPrice?.calculated_price || "$1.99"}
                                </span>
                              )}
                            </div>
                          )}
                          <div className="flex items-center gap-2 sm:gap-4 relative z-10">
                            <span className="text-gray-400 w-14 sm:w-16 text-right hidden sm:inline">
                              {(track?.product_variant?.metadata
                                ?.duration as string) || "3:00"}
                            </span>
                            {!purchasedSounds[track.id] && (
                              <div className="w-16 sm:w-20 text-right">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleAddToCart(track)}
                                  disabled={isAddingToCart}
                                  className="text-xs bg-dark-green hover:bg-dark-green text-white px-2 sm:px-3 py-1 h-7 sm:h-8"
                                >
                                  {isAddingToCart ? "Processing..." : "Buy"}
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>

      {/* Album Cover Modal */}
      {enlargedAlbumCover && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
          onClick={() => setEnlargedAlbumCover(null)}
        >
          <div className="relative max-w-3xl max-h-[90vh] p-2">
            <button
              onClick={() => setEnlargedAlbumCover(null)}
              className="absolute top-4 right-4 bg-gray-900/70 text-white rounded-full p-2 hover:bg-gray-800"
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
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            <Image
              src={enlargedAlbumCover}
              alt="Album Cover"
              width={800}
              height={800}
              className="max-h-[80vh] object-contain rounded-lg"
            />
          </div>
        </div>
      )}

      {/* Payment Popup */}
      {isPaymentPopupOpen && currentSound && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-bold text-white">
                Complete Your Purchase
              </h2>
              <Button
                onClick={() => setIsPaymentPopupOpen(false)}
                variant="ghost"
                className="text-gray-400 hover:text-white -mt-2 -mr-2"
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
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </Button>
            </div>

            {/* Purchase Summary */}
            <div className="mb-6 flex gap-4">
              <div className="w-24 h-24 bg-gray-800 rounded-lg overflow-hidden flex-shrink-0">
                <Image
                  src="/assets/album-cover.jpeg"
                  alt={currentSound.name || "Sound"}
                  width={96}
                  height={96}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-1">
                  {currentSound.name}
                </h3>
                <p className="text-gray-400 text-sm mb-2">
                  {currentSound.description || "Premium audio content"}
                </p>
                {currentSound.product_variant && (
                  <div className="text-dark-green font-medium">
                    {getDigitalProductPrice({
                      variant: currentSound.product_variant,
                    }).cheapestPrice?.calculated_price || "$1.99"}
                  </div>
                )}
              </div>
            </div>

            {/* Customer Information */}
            <div className="mb-6 border-t border-gray-800 pt-4">
              <h3 className="text-lg font-medium text-white mb-4">
                Customer Information
              </h3>
              <div className="bg-gray-800 p-4 rounded-lg">
                {isLoadingCustomer ? (
                  <div className="flex items-center justify-center py-2">
                    <div className="w-5 h-5 border-2 border-dark-green border-t-transparent rounded-full animate-spin mr-2"></div>
                    <span className="text-gray-400">
                      Loading customer information...
                    </span>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-400">Name</span>
                      <span className="text-white font-medium">
                        {formData["shipping_address.first_name"]}{" "}
                        {formData["shipping_address.last_name"]}
                      </span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-400">Email</span>
                      <span className="text-white font-medium">
                        {formData.email}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Country</span>
                      <span className="text-white font-medium">
                        {formData[
                          "shipping_address.country_code"
                        ]?.toUpperCase() || "US"}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
            {/* Order Summary */}
            <div className="border-t border-gray-800 pt-4 mb-6">
              <h3 className="text-lg font-medium text-white mb-4">
                Order Summary
              </h3>
              <div className="flex justify-between text-white mb-2">
                <span>Subtotal:</span>
                <span>
                  {currentSound.product_variant
                    ? getDigitalProductPrice({
                        variant: currentSound.product_variant,
                      }).cheapestPrice?.calculated_price
                    : "$1.99"}
                </span>
              </div>
              <div className="flex justify-between text-white font-bold mt-2 pt-2 border-t border-gray-800">
                <span>Total:</span>
                <span>
                  {currentSound.product_variant
                    ? getDigitalProductPrice({
                        variant: currentSound.product_variant,
                      }).cheapestPrice?.calculated_price
                    : "$1.99"}
                </span>
              </div>
            </div>

            {/* Payment Methods */}
            <div className="mb-6 border-t border-gray-800 pt-4">
              <AuthorizeNetPayment
                paymentMethod={selectedPaymentMethod}
                cardData={cardData}
                setCardData={handleCardDataChange}
                setPaymentData={setPaymentData}
                setWalletPaymentType={setWalletPaymentType}
                walletPaymentType={walletPaymentType}
                errorMessage={errorMessage}
                isAuthorizeNetFunc={isAuthorizeNetFunc}
                handleSubmit={handlePaymentComplete}
                isLoading={submitting}
                buttonText="Complete Purchase"
                totalPrice={
                  currentSound?.product_variant
                    ? getDigitalProductPrice({
                        variant: currentSound.product_variant,
                      }).cheapestPrice?.calculated_price
                    : "1.99"
                }
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
