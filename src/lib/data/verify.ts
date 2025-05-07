"use server"

import { sdk } from "@lib/config"
import medusaError from "@lib/util/medusa-error"

export const verifyMerchant = async (body: any) => {
  const updateRes = await sdk.client
    .fetch(`/store/apple-pay`, {
      method: "POST",
      body: {
        validationURL: body.validationURL,
      },
    })
    .catch(medusaError)

  return updateRes
}
