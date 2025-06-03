'use client'

import { useEffect, useState } from 'react'

interface BannerScriptProps {}

export default function BannerScript({}: BannerScriptProps) {
  const [isBannerVisible, setIsBannerVisible] = useState(true)
  
  useEffect(() => {
    // Check if banner is dismissed on initial load
    const dismissed = localStorage.getItem('auditionBannerDismissed')
    const isVisible = dismissed !== 'true'
    
    setIsBannerVisible(isVisible)
    
    // Set data attribute on document for CSS selectors
    document.documentElement.setAttribute('data-banner-visible', isVisible.toString())
    
    // Find the Nav component and update its padding
    const navElement = document.querySelector('nav')
    if (navElement) {
      if (isVisible) {
        navElement.classList.add('pt-10')
        navElement.classList.remove('pt-0')
      } else {
        navElement.classList.add('pt-0')
        navElement.classList.remove('pt-10')
      }
    }
    
    // Listen for custom event when banner is dismissed
    const handleBannerChange = (e: CustomEvent) => {
      const newIsVisible = e.detail.isVisible
      setIsBannerVisible(newIsVisible)
      
      // Update data attribute
      document.documentElement.setAttribute('data-banner-visible', newIsVisible.toString())
      
      // Update Nav padding
      const navElement = document.querySelector('nav')
      if (navElement) {
        if (newIsVisible) {
          navElement.classList.add('pt-10')
          navElement.classList.remove('pt-0')
        } else {
          navElement.classList.add('pt-0')
          navElement.classList.remove('pt-10')
        }
      }
    }
    
    // Add event listener
    window.addEventListener('bannerVisibilityChange' as any, handleBannerChange)
    
    // Clean up
    return () => {
      window.removeEventListener('bannerVisibilityChange' as any, handleBannerChange)
    }
  }, [])
  
  return null
}
