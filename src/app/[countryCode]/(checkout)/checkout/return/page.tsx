import { Metadata } from "next"
import CloverReturn from "@modules/checkout/components/clover-return"

export const metadata: Metadata = {
  title: "Completing payment",
  description: "Finalizing your Clover payment",
}

export default function CloverReturnPage() {
  return <CloverReturn />
}
