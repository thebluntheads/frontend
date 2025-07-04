import { NextRequest, NextResponse } from "next/server"

// Environment variables for Mux API authentication
const MUX_TOKEN_ID = process.env.MUX_TOKEN_ID
const MUX_TOKEN_SECRET = process.env.MUX_TOKEN_SECRET

export async function POST(request: NextRequest) {
  try {
    // Check if Mux credentials are available
    if (!MUX_TOKEN_ID || !MUX_TOKEN_SECRET) {
      return NextResponse.json(
        { error: "Mux API credentials not configured" },
        { status: 500 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { assetId, metadata } = body

    // Validate required fields
    if (!assetId) {
      return NextResponse.json(
        { error: "Asset ID is required" },
        { status: 400 }
      )
    }

    if (!metadata || typeof metadata !== "object") {
      return NextResponse.json(
        { error: "Metadata object is required" },
        { status: 400 }
      )
    }

    // Create authorization header for Mux API - using basic auth with API key and secret
    const authHeader = Buffer.from(
      `${MUX_TOKEN_ID}:${MUX_TOKEN_SECRET}`
    ).toString("base64")

    // Call Mux API to update asset metadata
    const response = await fetch(
      `https://api.mux.com/video/v1/assets/${assetId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${authHeader}`,
        },
        body: JSON.stringify({
          meta: metadata,
        }),
      }
    )

    if (!response.ok) {
      const errorData = await response.json()
      return NextResponse.json(
        { error: "Failed to update Mux asset metadata", details: errorData },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("Error updating Mux asset metadata:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
