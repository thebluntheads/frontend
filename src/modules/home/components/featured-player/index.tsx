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
import { PlayButton } from "../../../../components/ui/audio-wave"
import AudioPlayer from "../../../../components/ui/audio-player"
import { listSounds, listAlbums } from "@lib/data/digital-products"
import { getDigitalProductPrice } from "@lib/util/get-product-price"
import { Button } from "components/ui/button"

export const FeaturedPlayer = () => {
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

  const [enlargedAlbumCover, setEnlargedAlbumCover] = useState<string | null>(
    null
  )

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
        // Determine which URL to use based on purchase status
        const audioUrl = track?.preview_url

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
                      <span className="text-gray-400">
                        {albumTracks[album.id].length} tracks
                      </span>{" "}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => (window.location.href = "/sounds")}
                        className="text-xs bg-dark-green hover:bg-dark-green text-white px-3 py-1 h-8"
                      >
                        Buy Season One SoundTrack
                      </Button>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-4"></div>
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
                        <span className="w-16 sm:w-20 text-right">Price</span>
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
                          <div className="flex items-center gap-2 sm:gap-4 relative z-10">
                            <span className="text-gray-400 w-14 sm:w-16 text-right hidden sm:inline">
                              {(track?.product_variant?.metadata
                                ?.duration as string) || "3:00"}
                            </span>
                            <div className="w-16 sm:w-20 text-right">
                              {track.product_variant && (
                                <span className="text-dark-green font-medium text-xs">
                                  {getDigitalProductPrice({
                                    variant: track.product_variant,
                                  }).cheapestPrice?.calculated_price || "$1.99"}
                                </span>
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
    </div>
  )
}
