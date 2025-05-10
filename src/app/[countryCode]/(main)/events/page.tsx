import { Metadata } from "next"
import Image from "next/image"
import { Button } from "../../../../components/ui/button"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Events | TheBluntHeads",
  description: "Check out our upcoming events and gatherings.",
  openGraph: {
    title: "Events | TheBluntHeads",
    description: "Check out our upcoming events and gatherings.",
    images: [
      {
        url: "https://onconnects-media.s3.us-east-1.amazonaws.com/p/pu/8866_1735924247_32ec7af3f2b0e7462472.png",
        width: 1200,
        height: 630,
        alt: "TheBluntHeads Events",
      },
    ],
    type: "website",
    siteName: "TheBluntHeads",
  },
  twitter: {
    card: "summary_large_image",
    title: "Events | TheBluntHeads",
    description: "Check out our upcoming events and gatherings.",
    images: [
      "https://onconnects-media.s3.us-east-1.amazonaws.com/p/pu/8866_1735924247_32ec7af3f2b0e7462472.png",
    ],
  },
}

export default function EventsPage() {
  // External event host URL - replace with actual URL when available
  const eventHostUrl = "https://partiful.com/e/vahd9NmblOfjinRXZQdQ"

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Events</h1>

          <div className="relative w-full rounded-xl overflow-hidden mb-8 group cursor-pointer">
            <Link
              href={eventHostUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <Image
                src="/assets/events.jpeg"
                alt="TheBluntHeads Events"
                width={1200}
                height={800}
                className="w-full h-auto transition-transform duration-500 group-hover:scale-105"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <div className="bg-black/60 text-white px-6 py-3 rounded-full backdrop-blur-md border border-white/20">
                  View Events
                </div>
              </div>
            </Link>
          </div>

          <div className="space-y-6">
            <p className="text-lg text-white/80">
              Join us at our upcoming events and connect with the community.
              Experience exclusive content, meet the creators, and be part of
              the TheBluntHeads culture.
            </p>

            <div className="flex justify-center mt-8">
              <Link
                href={eventHostUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button className="bg-green-600 hover:bg-green-700 text-white px-8 py-6 text-lg rounded-xl">
                  View All Events
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
