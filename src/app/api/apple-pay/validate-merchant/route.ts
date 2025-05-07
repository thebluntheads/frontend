import { verifyMerchant } from "@lib/data/verify"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const { validationURL } = await request.json()

  const merchantSession = await verifyMerchant({ validationURL })
  return NextResponse.json(merchantSession)
}
