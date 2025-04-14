"use client"

import { useEffect, useState } from "react"

export type Customer = {
  id: string
  email: string
  first_name: string | null
  last_name: string | null
  billing_address?: {
    first_name: string
    last_name: string
    address_1: string
    address_2: string | null
    city: string
    country_code: string
    province: string | null
    postal_code: string
    phone: string | null
  } | null
  shipping_addresses?: Array<{
    first_name: string
    last_name: string
    address_1: string
    address_2: string | null
    city: string
    country_code: string
    province: string | null
    postal_code: string
    phone: string | null
  }>
}

export function useCustomer() {
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCustomer = async () => {
      setIsLoading(true)
      setError(null)
      
      try {
        const response = await fetch('/api/customer')
        
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to fetch customer data')
        }
        
        const data = await response.json()
        setCustomer(data.customer)
      } catch (err) {
        console.error('Error fetching customer:', err)
        setError(err instanceof Error ? err.message : 'An unknown error occurred')
        setCustomer(null)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCustomer()
  }, [])

  return { customer, isLoading, error }
}
