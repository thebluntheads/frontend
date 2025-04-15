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
import { getSoundContentUrl, getAlbumSoundUrls } from "@lib/data/sound-download"
import { downloadFile, downloadMultipleFiles } from "@lib/util/download-helper"
import {
  addToStreamCart,
  retrieveStreamCart,
  placeDigitalProductOrder,
  listStreamCartOptions,
  initiateStreamPaymentSession,
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

export default function SoundsPage() {
  const { customer, isLoading: isLoadingCustomer } = useCustomer()
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

  const [isDownloading, setIsDownloading] = useState<Record<string, boolean>>(
    {}
  )

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

        console.log("Purchased sounds:", purchaseStatus)
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
        console.log("Sound already in cart, opening payment popup")
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

  // Handle payment completion
  const handlePaymentComplete = async () => {
    setIsLoading(true)
    setErrorMessage(null)

    try {
      console.log(cardData)
      const shouldInputCard =
        isAuthorizeNetFunc(selectedPaymentMethod) && !activeSession
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
        console.log({ transactionResponse })
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
          console.log(JSON.stringify(payc))
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
      console.log("Track change in progress, ignoring request")
      return
    }

    isChangingTrack.current = true

    try {
      console.log(trackId, sounds)
      const track = sounds.find((sound) => sound.id === trackId)
      console.log("Track data:", track) // Debug track data

      if (playingTrackId === trackId) {
        // Stop playing current track
        console.log("Stopping playback")
        setPlayingTrackId(null)
        setCurrentAudioSrc("")
        setAudioProgress(0) // Reset progress
      } else {
        // If another track is playing, stop it first
        if (playingTrackId) {
          console.log("Stopping previous track before playing new one")
          setPlayingTrackId(null)
          setCurrentAudioSrc("")

          // Small delay to ensure the previous audio is properly stopped
          await new Promise((resolve) => setTimeout(resolve, 50))
        }

        // Start playing new track
        console.log("Starting playback for track:", trackId)
        console.log({ purchasedContentUrl })
        // Determine which URL to use based on purchase status
        const hasPurchased = purchasedSounds[trackId] || false
        const audioUrl = hasPurchased
          ? purchasedContentUrl[track?.id!]
          : track?.preview_url
        console.log(
          `Using ${hasPurchased ? "full content" : "preview"} URL:`,
          audioUrl,
          track
        )

        // Set the source first, then set the playing track ID
        setCurrentAudioSrc(audioUrl || "")

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
    console.log("Audio playback ended")
    setPlayingTrackId(null)
    setCurrentAudioSrc("")
    setAudioProgress(0) // Reset progress
  }

  // Debug function to track progress
  const handleProgress = (progress: number) => {
    console.log(`Audio progress: ${Math.round(progress * 100)}%`)
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
              company: formData["shipping_address.company"],
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
              company: formData["shipping_address.company"],
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

  // Function to download a single sound
  const handleDownloadSound = async (sound: DigitalProduct) => {
    setIsDownloading((prev) => ({ ...prev, [sound.id]: true }))
    try {
      // For purchased sounds, we can directly use the content_url if available
      if (sound.content_url) {
        const filename = `${sound.name.replace(/\s+/g, "_")}.mp3`
        await downloadFile(sound.content_url, filename)
      } else {
        // Otherwise, get the content URL from the server
        const url = await getSoundContentUrl(
          sound.id,
          sound.parent_id || undefined
        )
        if (url) {
          const filename = `${sound.name.replace(/\s+/g, "_")}.mp3`
          await downloadFile(url, filename)
        } else {
          console.error("No download URL available for this sound")
        }
      }
    } catch (error) {
      console.error("Error downloading sound:", error)
    } finally {
      setIsDownloading((prev) => ({ ...prev, [sound.id]: false }))
    }
  }

  // Function to download all sounds in an album
  const handleDownloadAlbum = async (albumId: string) => {
    setIsDownloading((prev) => ({ ...prev, [`album_${albumId}`]: true }))
    try {
      // Get all purchased sound URLs in the album
      const soundFiles = await getAlbumSoundUrls(albumId)

      if (soundFiles && soundFiles.length > 0) {
        // Add file extension to the names
        const filesWithProperNames = soundFiles.map((file) => ({
          ...file,
          name: `${file.name.replace(/\s+/g, "_")}`,
        }))

        // Download all files sequentially
        await downloadMultipleFiles(filesWithProperNames)
      } else {
        console.error("No downloadable sounds found in this album")
      }
    } catch (error) {
      console.error("Error downloading album:", error)
    } finally {
      setIsDownloading((prev) => ({ ...prev, [`album_${albumId}`]: false }))
    }
  }

  if (isLoading) {
    return (
      <div className="bg-black min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
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

      {/* Debug indicator */}
      <div className="fixed bottom-4 right-4 bg-black/80 text-white p-2 rounded-lg z-50 text-xs">
        {playingTrackId ? (
          <>
            <div>Playing: {playingTrackId}</div>
            <div>Progress: {Math.round(audioProgress * 100)}%</div>
          </>
        ) : (
          "Not playing"
        )}
      </div>
      {/* Elegant sound browser header with waveform */}
      <div className="w-full bg-black py-10">
        <div className="container mx-auto px-6">
          <div className="flex flex-col items-center justify-center text-center mb-8">
            <div className="w-full max-w-4xl relative">
              {/* Animated waveform background */}
              <div className="absolute inset-0 flex items-center justify-center opacity-20">
                <div className="w-full h-20 flex items-center justify-center gap-1">
                  {Array.from({ length: 50 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-full w-1 bg-blue-500 rounded-full"
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
              <div className="relative z-10 py-12">
                <h1 className="text-5xl font-bold text-white mb-4 tracking-tight">
                  <span className="text-blue-500">Sound</span>Track Library
                </h1>
                <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                  Explore our curated collection of premium audio tracks and
                  albums
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
      <div className="container mx-auto px-6 py-12">
        <Tabs
          value={activeAlbumId || ""}
          onValueChange={setActiveAlbumId}
          className="w-full"
        >
          <div className="flex justify-between items-center mb-8">
            <TabsList className="bg-gray-900/50 p-1 rounded-lg overflow-x-auto">
              {albums.map((album) => (
                <TabsTrigger
                  key={album.id}
                  value={album.id}
                  className="rounded-md px-4 py-2 data-[state=active]:bg-blue-600 whitespace-nowrap"
                >
                  {album.name}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {albums.map((album) => (
            <TabsContent key={album.id} value={album.id} className="space-y-12">
              {(albumTracks[album.id] || []).length === 0 ? (
                <p className="text-white text-center">
                  No tracks available for this album.
                </p>
              ) : (
                <div className="bg-gray-900/30 rounded-xl overflow-hidden border border-gray-800">
                  {/* Album Info - Only once */}
                  <div className="p-6 flex flex-col md:flex-row gap-6">
                    <div className="w-full md:w-48 h-48 rounded-lg overflow-hidden flex-shrink-0">
                      <Image
                        src="/assets/preview.png"
                        alt={album.name}
                        width={192}
                        height={192}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold text-white mb-2">
                        {album.name}
                      </h2>
                      <p className="text-gray-400 mb-4">
                        {album.description || "No description available."}
                      </p>

                      <div className="flex items-center gap-4">
                        <span className="text-gray-400">
                          {albumTracks[album.id].length} tracks
                        </span>
                        {Object.values(purchasedSounds).filter((ps) => !ps)
                          .length === albumTracks[album.id].length ? (
                          <>
                            <span className="text-gray-400">
                              {album.product_variant && (
                                <span className="text-blue-500 font-medium text-xs">
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
                              className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 h-8"
                            >
                              {isAddingToCart ? "Adding..." : "Buy"}
                            </Button>
                          </>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="text-green-500 text-xs font-medium">
                              Purchased
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDownloadAlbum(album.id)}
                              disabled={isDownloading[`album_${album.id}`]}
                              className="text-xs bg-green-600 hover:bg-green-700 text-white px-3 py-1 h-8"
                            >
                              {isDownloading[`album_${album.id}`]
                                ? "..."
                                : "Download All"}
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Track List */}
                  <div className="border-t border-gray-800">
                    <div className="p-4 flex justify-between text-gray-400 text-sm uppercase font-medium">
                      <div className="flex items-center gap-4">
                        <span className="w-10"></span>
                        <span className="w-8 text-center">#</span>
                        <span>Title</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="w-16 text-right">Duration</span>
                        <span className="w-20 text-right">Price</span>
                        <span className="w-20 text-right">Action</span>
                      </div>
                    </div>

                    <div className="divide-y divide-gray-800/50">
                      {albumTracks[album.id].map((track, index) => (
                        <div
                          key={track.id}
                          className="p-4 flex justify-between items-center hover:bg-gray-800/30 transition-colors group relative"
                        >
                          {playingTrackId === track.id && (
                            <div className="absolute left-0 top-0 bottom-0 w-full h-full bg-blue-600/10 z-0"></div>
                          )}

                          {/* Progress bar at the bottom of the track */}
                          {playingTrackId === track.id && (
                            <div
                              className="absolute left-0 bottom-0 h-2 bg-blue-600 z-10"
                              style={{
                                width: `${audioProgress * 100}%`,
                                transition: "width 0.1s linear",
                              }}
                            ></div>
                          )}
                          <div className="flex items-center gap-4 relative z-10">
                            <PlayButton
                              isPlaying={playingTrackId === track.id}
                              onClick={() => togglePlay(track.id)}
                              className="opacity-100 bg-blue-600 hover:bg-blue-700"
                            />
                            <div className="w-8 flex justify-center items-center">
                              <span className="text-center text-gray-500">
                                {index + 1}
                              </span>
                            </div>
                            <div>
                              <h4 className="text-white font-medium">
                                {track.name}
                              </h4>
                              <p className="text-gray-500 text-sm">
                                Artist Name
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 relative z-10">
                            <span className="text-gray-400 w-16 text-right">
                              {(track?.product_variant?.metadata
                                ?.duration as string) || "3:00"}
                            </span>
                            <div className="w-20 text-right">
                              {track.product_variant && (
                                <span className="text-blue-500 font-medium text-xs">
                                  {getDigitalProductPrice({
                                    variant: track.product_variant,
                                  }).cheapestPrice?.calculated_price || "$1.99"}
                                </span>
                              )}
                            </div>
                            <div className="w-20 text-right">
                              {!purchasedSounds[track.id] ? (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleAddToCart(track)}
                                  disabled={isAddingToCart}
                                  className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 h-8"
                                >
                                  {isAddingToCart ? "Adding..." : "Buy"}
                                </Button>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleDownloadSound(track)}
                                    disabled={isDownloading[track.id]}
                                    className="text-xs bg-green-600 hover:bg-green-700 text-white px-3 py-1 h-8"
                                  >
                                    {isDownloading[track.id]
                                      ? "preparing..."
                                      : "Download"}
                                  </Button>
                                </div>
                              )}
                            </div>
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
                  src="/assets/preview.png"
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
                  <div className="text-blue-500 font-medium">
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
                    <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-2"></div>
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
                errorMessage={errorMessage}
                isAuthorizeNetFunc={isAuthorizeNetFunc}
                handleSubmit={handlePaymentComplete}
                isLoading={submitting}
                buttonText="Complete Purchase"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
