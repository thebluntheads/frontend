import { Resend } from "resend"
import { NextRequest, NextResponse } from "next/server"
import AuditionSubmissionEmail from "../../../../emails/audition-submission"
import AuditionConfirmationEmail from "../../../../emails/audition-confirmation"

// Initialize Resend with API key
// NOTE: You should store this in an environment variable
const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const formData = await request.json()

    // Extract form fields
    const { name, email, instagram, tiktok, character, videoLink } = formData

    // Validate required fields
    if (!name || !email || !character || !videoLink) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Find the character script based on the selected character
    const characters = [
      {
        id: "black-cake",
        name: "Black Cake",
        image: "/assets/black-cake.png",
        script:
          "What did I tell you to do? I'm not going to say it\nAgain. Now, go back in the house and put on\nSomething decent. Stop looking like a 1959 Tramp",
      },
      {
        id: "gelato",
        name: "Gelato",
        image: "/assets/gelato.png",
        script:
          "Hey Kush, let's catch the bus down to the hood\nTo see hang up with the homies. I was thinking\nBout getting another tattoo.",
      },
      {
        id: "thai-stick",
        name: "Thai Stick",
        image: "/assets/thai-stick.png",
        script:
          "I Know you. You want Chinese fried rice wit\nExtra chicken and shrimp. That would be\n$17.93. No EBT card, only cash or credit card.",
      },
      {
        id: "skittle-wrap",
        name: "Skittle Wrap",
        image: "/assets/skittle-rap.png",
        script:
          "H E Y-G I R L! What are you doing this Saturday, nothing!?\nWell, have plans to go to the WEHO Pride Parade around one\no' clock. I can pick you up or I can meet you there.",
      },
    ]

    const selectedCharacter = characters.find((c) => c.id === character)
    const characterName = selectedCharacter ? selectedCharacter.name : character
    const characterScript = selectedCharacter
      ? selectedCharacter.script
      : "No script available"

    // Send email using Resend
    const { data, error } = await resend.emails.send({
      from: "The Blunt Heads <auditions@thebluntheads.com>",
      to: ["kcm.anouar@gmail.com"],
      subject: `New Audition: ${name} for ${characterName}`,
      react: AuditionSubmissionEmail({
        name,
        email,
        instagram: instagram || "Not provided",
        tiktok: tiktok || "Not provided",
        character: characterName,
        characterScript,
        videoLink: videoLink || "Not provided",
      }),
    })

    // Also send a confirmation email to the applicant
    await resend.emails.send({
      from: "TheBluntHeads Audition<info@thebluntheads.com>",
      to: [email],
      subject: `Your Audition Application - The Blunt Heads`,
      react: AuditionConfirmationEmail({
        name,
        email,
        instagram: instagram || "Not provided",
        tiktok: tiktok || "Not provided",
        character: characterName,
        characterScript,
        videoLink: videoLink || "Not provided",
      }),
    })

    if (error) {
      console.error("Error sending email:", error)
      return NextResponse.json(
        { error: "Failed to send email" },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        message: "Audition submitted successfully",
        data,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error processing audition submission:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
