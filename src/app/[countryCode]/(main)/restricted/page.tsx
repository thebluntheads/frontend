"use client"

import React from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Heading, Text, Button } from "@medusajs/ui"
import { setCookie } from "cookies-next"

export default function RestrictedPage() {
  const router = useRouter()
  
  // Function to handle revoking the age restriction
  const handleRevokeRestriction = () => {
    // Clear localStorage item
    localStorage.removeItem("ageVerified")
    
    // Set cookie to true to allow access
    setCookie("ageVerified", "true", {
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/"
    })
    
    // Redirect to home page
    router.push("/")
  }
  return (
    <div className="bg-black min-h-screen py-16 flex flex-col items-center justify-center">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-2xl text-center">
        <div className="mb-8 flex justify-center">
          <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-dark-green">
            <Image
              src="/assets/preview.png"
              alt="The Blunt Heads"
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>

        <Heading
          level="h1"
          className="text-4xl md:text-5xl font-bold text-white mb-8"
        >
          Age Restricted Content
        </Heading>

        <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-8 border border-gray-700/50 mb-8">
          <Text className="text-xl text-white mb-6">
            We're sorry, but The Blunt Heads content is only available to users who are 18 years of age or older.
          </Text>

          <Text className="text-lg text-gray-300 mb-8">
            This site contains mature content related to cannabis culture and comedy that is intended for adult audiences only.
          </Text>

          <div className="flex flex-col items-center">
            <Image
              src="/assets/logo.png"
              alt="The Blunt Heads Logo"
              width={180}
              height={60}
              className="mb-6 opacity-70"
            />
            
            <Text className="text-gray-400 text-sm mb-6">
              Thank you for your understanding.
            </Text>

            <Button
              className="bg-dark-green hover:bg-light-green text-white font-medium px-6 py-2 rounded-full flex items-center gap-2 mx-auto"
              onClick={handleRevokeRestriction}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 12h18m-18 0l5-5m-5 5l5 5" />
              </svg>
              I made a mistake - I am 18 or older
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
