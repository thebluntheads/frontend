"use client"

import Script from "next/script"

interface DigitalWalletScriptsProps {
  onGooglePayReady?: () => void
  onApplePayReady?: () => void
}

/**
 * Component to load necessary scripts for Apple Pay and Google Pay
 */
const DigitalWalletScripts = () => {
  return (
    <>
      {/* Google Pay API */}
      <Script
        src="https://pay.google.com/gp/p/js/pay.js"
        strategy="afterInteractive"
      />
    </>
  )
}

export default DigitalWalletScripts
