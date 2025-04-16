"use client"

import { useState } from "react"
import { Button } from "@medusajs/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

const NewsletterForm = () => {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email) {
      setError("Please enter your email address")
      return
    }
    
    setLoading(true)
    setError("")
    
    try {
      // Connect to our Mailchimp API endpoint
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to subscribe")
      }
      
      setSuccess(true)
      setEmail("")
      
      // Reset success message after 3 seconds
      setTimeout(() => {
        setSuccess(false)
      }, 3000)
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.")
      console.error("Newsletter signup error:", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="flex flex-col space-y-3">
        <div className="relative">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="w-full px-4 py-2 rounded-md bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-dark-green focus:border-transparent"
            disabled={loading || success}
          />
        </div>
        
        <Button 
          type="submit"
          className="w-full bg-dark-green hover:bg-light-green text-white font-medium py-2 rounded-md transition-colors"
          disabled={loading || success}
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              <span>Subscribing...</span>
            </div>
          ) : success ? (
            "Thanks for subscribing!"
          ) : (
            "Subscribe"
          )}
        </Button>
        
        {error && (
          <p className="text-red-400 text-xs mt-1">{error}</p>
        )}
      </form>
      
      <p className="text-xs text-white/50 mt-3">
        By subscribing, you agree to our <LocalizedClientLink href="/privacy-policy" className="underline hover:text-white/70">Privacy Policy</LocalizedClientLink>
      </p>
    </div>
  )
}

export default NewsletterForm
