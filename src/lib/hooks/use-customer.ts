"use client"

import { retrieveCustomer } from "@lib/data/customer"
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
        const customer = await retrieveCustomer()

        setCustomer(customer)
      } catch (err) {
        setCustomer(null)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCustomer()
  }, [])

  return { customer, isLoading }
}
