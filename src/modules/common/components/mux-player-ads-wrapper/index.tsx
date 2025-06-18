"use client"

import React, { useEffect, useRef, useState } from "react"
import Script from "next/script"
import MuxVideoPlayer from "@modules/common/components/mux-player"
import { useTranslations } from "next-intl"

// Using type definitions from @types/google_interactive_media_ads_types

// Define props interface
interface MuxPlayerAdsWrapperProps {
  playbackId: string
  thumbnailUrl?: string
  alt?: string
  jwt?: string
  className?: string
  autoPlay?: boolean
  onEnded?: () => void
  customerId?: string
  videoTitle?: string
  adTagUrl?: string // URL for the ad tag
  enableAds?: boolean // Control whether to show ads
}

const MuxPlayerAdsWrapper: React.FC<MuxPlayerAdsWrapperProps> = ({
  playbackId,
  thumbnailUrl,
  alt,
  jwt,
  className,
  autoPlay,
  onEnded,
  customerId,
  videoTitle,
  adTagUrl = "https://pubads.g.doubleclick.net/gampad/ads?iu=/21775744923/external/single_ad_samples&sz=640x480&cust_params=sample_ct%3Dlinear&ciu_szs=300x250%2C728x90&gdfp_req=1&output=vast&unviewed_position_start=1&env=vp&impl=s&correlator=",
  enableAds = true,
}) => {
  const t = useTranslations()
  
  // Refs for DOM elements
  const containerRef = useRef<HTMLDivElement>(null)
  const adContainerRef = useRef<HTMLDivElement>(null)
  const playerRef = useRef<HTMLDivElement>(null)
  
  // State for IMA SDK
  const [imaSDKLoaded, setImaSDKLoaded] = useState(false)
  const [adDisplayContainer, setAdDisplayContainer] = useState<any>(null)
  const [adsLoader, setAdsLoader] = useState<any>(null)
  const [adsManager, setAdsManager] = useState<any>(null)
  const [isAdPlaying, setIsAdPlaying] = useState(false)
  const [muxPlayerInstance, setMuxPlayerInstance] = useState<any>(null)

  // Handle IMA SDK loading
  const handleIMAScriptLoad = () => {
    setImaSDKLoaded(true)
  }

  // Initialize ad container and loader when IMA SDK is loaded
  useEffect(() => {
    if (!imaSDKLoaded || !adContainerRef.current || !enableAds || typeof window === "undefined" || !window.google?.ima) return

    // Find the Mux player element
    const findMuxPlayer = () => {
      if (!playerRef.current) return null
      
      // Look for mux-player element
      const muxPlayer = playerRef.current.querySelector("mux-player")
      if (muxPlayer) {
        setMuxPlayerInstance(muxPlayer)
        return muxPlayer
      }
      return null
    }

    const muxPlayer = findMuxPlayer()
    if (!muxPlayer) {
      // If player not found, try again after a short delay
      const timer = setTimeout(findMuxPlayer, 500)
      return () => clearTimeout(timer)
    }

    // Initialize ad display container
    const adDisplayContainer = new window.google.ima.AdDisplayContainer(
      adContainerRef.current
      // The second parameter is optional and we'll handle video element differently
    )
    setAdDisplayContainer(adDisplayContainer)

    // Initialize ads loader
    const adsLoader = new window.google.ima.AdsLoader(adDisplayContainer)
    setAdsLoader(adsLoader)

    // Add event listeners
    adsLoader.addEventListener(
      window.google.ima.AdsManagerLoadedEvent.Type.ADS_MANAGER_LOADED,
      onAdsManagerLoaded,
      false
    )
    adsLoader.addEventListener(
      window.google.ima.AdErrorEvent.Type.AD_ERROR,
      onAdError,
      false
    )

    // Request ads
    requestAds()

    // Cleanup function
    return () => {
      if (adsLoader) {
        adsLoader.removeEventListener(
          window.google.ima.AdsManagerLoadedEvent.Type.ADS_MANAGER_LOADED,
          onAdsManagerLoaded
        )
        adsLoader.removeEventListener(
          window.google.ima.AdErrorEvent.Type.AD_ERROR,
          onAdError
        )
        adsLoader.destroy()
      }
      
      if (adsManager) {
        adsManager.destroy()
      }
    }
  }, [imaSDKLoaded, enableAds])

  // Request ads from the ad server
  const requestAds = () => {
    if (!adsLoader || !containerRef.current) return

    const adsRequest = new window.google.ima.AdsRequest()
    adsRequest.adTagUrl = adTagUrl

    // Specify the linear and nonlinear slot sizes
    const containerWidth = containerRef.current.clientWidth
    const containerHeight = containerRef.current.clientHeight

    adsRequest.linearAdSlotWidth = containerWidth || 640
    adsRequest.linearAdSlotHeight = containerHeight || 360
    adsRequest.nonLinearAdSlotWidth = containerWidth || 640
    adsRequest.nonLinearAdSlotHeight = (containerHeight || 360) / 3

    // Request ads
    adsLoader.requestAds(adsRequest)
  }

  // Handle ads manager loaded event
  const onAdsManagerLoaded = (adsManagerLoadedEvent: any) => {
    if (!muxPlayerInstance || !containerRef.current) return

    // Get the ads manager
    const adsRenderingSettings = new window.google.ima.AdsRenderingSettings()
    const adsManager = adsManagerLoadedEvent.getAdsManager(
      muxPlayerInstance,
      adsRenderingSettings
    )
    setAdsManager(adsManager)

    // Add event listeners to the ads manager
    adsManager.addEventListener(
      window.google.ima.AdErrorEvent.Type.AD_ERROR,
      onAdError
    )
    adsManager.addEventListener(
      window.google.ima.AdEvent.Type.CONTENT_PAUSE_REQUESTED,
      onContentPauseRequested
    )
    adsManager.addEventListener(
      window.google.ima.AdEvent.Type.CONTENT_RESUME_REQUESTED,
      onContentResumeRequested
    )
    adsManager.addEventListener(
      window.google.ima.AdEvent.Type.ALL_ADS_COMPLETED,
      onAllAdsCompleted
    )

    // Initialize and start the ads manager
    try {
      const containerWidth = containerRef.current.clientWidth || 640
      const containerHeight = containerRef.current.clientHeight || 360
      
      adsManager.init(
        containerWidth,
        containerHeight,
        0 // Using 0 for NORMAL view mode
      )
      adsManager.start()
      setIsAdPlaying(true)
    } catch (adError) {
      console.error("Ads manager initialization error:", adError)
      // If ad fails, continue with the content
      if (muxPlayerInstance) {
        muxPlayerInstance.play()
      }
    }
  }

  // Handle ad error event
  const onAdError = (adErrorEvent: any) => {
    console.error("Ad error:", adErrorEvent.getError())
    if (adsManager) {
      adsManager.destroy()
    }
    setIsAdPlaying(false)
    if (muxPlayerInstance) {
      muxPlayerInstance.play()
    }
  }

  // Handle content pause requested event
  const onContentPauseRequested = () => {
    setIsAdPlaying(true)
    if (muxPlayerInstance) {
      muxPlayerInstance.pause()
    }
  }

  // Handle content resume requested event
  const onContentResumeRequested = () => {
    setIsAdPlaying(false)
    if (muxPlayerInstance) {
      muxPlayerInstance.play()
    }
  }

  // Handle all ads completed event
  const onAllAdsCompleted = () => {
    setIsAdPlaying(false)
    if (muxPlayerInstance) {
      muxPlayerInstance.play()
    }
  }

  // Handle Mux player events
  useEffect(() => {
    if (!muxPlayerInstance || !adDisplayContainer || !adsManager || !isAdPlaying) return

    const handlePlay = () => {
      adDisplayContainer.initialize()
    }

    const handlePause = () => {
      if (adsManager && isAdPlaying) {
        adsManager.pause()
      }
    }

    const handlePlaying = () => {
      if (adsManager && isAdPlaying) {
        adsManager.resume()
      }
    }

    // Add event listeners to Mux player
    muxPlayerInstance.addEventListener("play", handlePlay)
    muxPlayerInstance.addEventListener("pause", handlePause)
    muxPlayerInstance.addEventListener("playing", handlePlaying)

    // Cleanup function
    return () => {
      muxPlayerInstance.removeEventListener("play", handlePlay)
      muxPlayerInstance.removeEventListener("pause", handlePause)
      muxPlayerInstance.removeEventListener("playing", handlePlaying)
    }
  }, [muxPlayerInstance, adDisplayContainer, adsManager, isAdPlaying])

  return (
    <>
      {/* Load Google IMA SDK */}
      {enableAds && (
        <Script
          src="//imasdk.googleapis.com/js/sdkloader/ima3.js"
          onLoad={handleIMAScriptLoad}
          strategy="lazyOnload"
        />
      )}
      
      {/* Container for Mux player and ad container */}
      <div 
        ref={containerRef}
        className={`relative ${className || "w-full h-full"}`}
        style={{ position: "relative" }}
      >
        {/* Mux player container */}
        <div ref={playerRef} className="w-full h-full">
          <MuxVideoPlayer
            playbackId={playbackId}
            thumbnailUrl={thumbnailUrl || ""}
            alt={alt}
            jwt={jwt}
            className="w-full h-full"
            autoPlay={autoPlay}
            onEnded={onEnded}
            customerId={customerId}
            videoTitle={videoTitle}
          />
        </div>
        
        {/* Ad container */}
        {enableAds && (
          <div
            ref={adContainerRef}
            className={`absolute top-0 left-0 w-full h-full z-50 ${isAdPlaying ? "pointer-events-auto" : "pointer-events-none"}`}
            style={{ 
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              zIndex: 1000
            }}
          />
        )}
      </div>
    </>
  )
}

export default MuxPlayerAdsWrapper
