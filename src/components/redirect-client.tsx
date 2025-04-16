"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function RedirectClient() {
  const router = useRouter()
  
  useEffect(() => {
    // Redirect to home page after a short delay
    const timer = setTimeout(() => {
      router.push("/")
    }, 100)
    
    return () => clearTimeout(timer)
  }, [router])
  
  // This component doesn't render anything visible
  return null
}
