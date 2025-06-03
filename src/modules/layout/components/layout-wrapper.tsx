'use client'

import React from 'react'

interface LayoutWrapperProps {
  children: React.ReactNode
}

/**
 * A simple wrapper component that can be used to wrap layout elements
 * Note: This component is not currently used in the main layout
 */
export default function LayoutWrapper({ children }: LayoutWrapperProps) {
  return (
    <div className="layout-wrapper">
      {children}
    </div>
  )
}
