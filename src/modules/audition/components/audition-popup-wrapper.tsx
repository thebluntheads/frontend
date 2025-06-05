"use client"

import { useParams } from "next/navigation"
import AuditionPopup from "./audition-popup"

export default function AuditionPopupWrapper() {
  const params = useParams()
  const countryCode = params?.countryCode as string || "us"
  
  return <AuditionPopup countryCode={countryCode} />
}
