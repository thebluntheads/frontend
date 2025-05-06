"use client"

import { useEffect } from "react"
import Script from "next/script"

// Type definitions for digital wallet APIs
declare global {
  interface Window {
    ApplePaySession?: any
  }
}

interface DigitalWalletScriptsProps {
  onGooglePayReady?: () => void
  onApplePayReady?: () => void
}

/**
 * Component to load necessary scripts for Apple Pay and Google Pay
 */
const DigitalWalletScripts = ({
  onGooglePayReady,
  onApplePayReady,
}: DigitalWalletScriptsProps) => {
  // Check if Apple Pay is available
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      window.ApplePaySession &&
      window.ApplePaySession.canMakePayments()
    ) {
      onApplePayReady?.()
    }
  }, [onApplePayReady])

  return (
    <>
      {/* Google Pay API */}
      <Script
        src="https://pay.google.com/gp/p/js/pay.js"
        strategy="lazyOnload"
        onLoad={() => {
          if (onGooglePayReady) {
            onGooglePayReady()
          }
        }}
      />
      
      {/* Authorize.Net Accept.js for digital wallet integration */}
      <Script
        src={`https://js${
          process.env.NODE_ENV === "production" ? "" : ".sandbox"
        }.authorize.net/v3/AcceptUI.js`}
        strategy="lazyOnload"
      />
    </>
  )
}

export default DigitalWalletScripts
