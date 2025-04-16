import { NextRequest, NextResponse } from "next/server"
import mailchimp from "@mailchimp/mailchimp_marketing"

// Initialize Mailchimp with your API key and server prefix
mailchimp.setConfig({
  apiKey: process.env.MAILCHIMP_API_KEY!,
  server: process.env.MAILCHIMP_SERVER_PREFIX!, // e.g., "us1"
})

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      )
    }

    // Add member to Mailchimp list
    const listId = process.env.MAILCHIMP_LIST_ID

    if (!listId) {
      return NextResponse.json(
        { error: "Mailchimp list ID not configured" },
        { status: 500 }
      )
    }

    // Check if API key and server are configured
    if (!process.env.MAILCHIMP_API_KEY || !process.env.MAILCHIMP_SERVER_PREFIX) {
      return NextResponse.json(
        { error: "Mailchimp API not properly configured" },
        { status: 500 }
      )
    }

    try {
      // Add member to list
      const response = await mailchimp.lists.addListMember(listId, {
        email_address: email,
        status: "subscribed",
        merge_fields: {},
      })

      return NextResponse.json({
        success: true,
        message: "Successfully subscribed to the newsletter",
        id: response.id,
      })
    } catch (err: any) {
      // Handle Mailchimp specific errors
      if (err.status === 400 && err.response?.text) {
        const responseBody = JSON.parse(err.response.text)
        
        // If the email is already subscribed
        if (responseBody.title === "Member Exists") {
          return NextResponse.json({
            success: true,
            message: "You're already subscribed to our newsletter",
          })
        }
      }

      console.error("Mailchimp API error:", err)
      return NextResponse.json(
        { error: "Failed to subscribe to newsletter" },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error("Newsletter subscription error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
