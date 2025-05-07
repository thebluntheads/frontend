import { NextResponse } from "next/server"
import https from "https"
// import fetch from "node-fetch"

const MERCHANT_ID = "merchant.com.thebluntheads"
const DOMAIN = "thebluntheads.com"
const CERT_PASSWORD = process.env.CERT_PASSWORD
const CERT_P12_BASE64 = process.env.CERT_P12_BASE64!

export async function POST(request: Request) {
  try {
    const { validationURL } = await request.json()

    if (!validationURL) {
      console.error("Missing validationURL in request")
      return NextResponse.json(
        { error: "Missing validationURL in request" },
        { status: 400 }
      )
    }

    console.log("Received validation URL:", validationURL)

    // Prepare the merchant validation request
    const validationRequest = {
      merchantIdentifier: MERCHANT_ID,
      displayName: "JOHN BOY ENTERTAINMENT, INC",
      initiative: "web",
      initiativeContext: DOMAIN,
    }

    // const certBuffer = Buffer.from(CERT_P12_BASE64, "base64").toString("ascii")

    // const agent = new https.Agent({
    //   pfx: certBuffer,
    //   passphrase: "",
    // })

    // Send the validation data to Apple's validation URL
    const response = await fetch(validationURL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(validationRequest),
      //agent,
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Apple validation failed:", response.status, errorText)
      return NextResponse.json(
        { error: `Apple validation failed: ${response.status} ${errorText}` },
        { status: 500 }
      )
    }

    // Get the merchant session from Apple
    const merchantSession = await response.json()
    console.log("Successfully validated with Apple:", merchantSession)

    // Return the merchant session to the client
    return NextResponse.json(merchantSession)
  } catch (error) {
    console.error("Error during merchant validation:", error)
    return NextResponse.json(
      { error: `Failed to process merchant validation: ${error}` },
      { status: 500 }
    )
  }
}
