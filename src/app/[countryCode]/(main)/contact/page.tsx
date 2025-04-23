import { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"

export const metadata: Metadata = {
  title: "Contact | TheBluntHeads",
  description: "Get in touch with TheBluntHeads team.",
}

export default function ContactPage() {
  return (
    <div className="w-full max-w-6xl mx-auto py-16 px-4 md:px-8">
      <h1 className="text-4xl md:text-5xl font-bold text-center mb-12 text-white">
        Contact
      </h1>

      <div className="bg-gray-900/30 rounded-xl border border-gray-800 overflow-hidden p-8 md:p-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Phone Section */}
          <div className="flex flex-col">
            <h2 className="text-2xl font-medium mb-4 text-white">Call Us</h2>
            <div className="flex items-center bg-gray-800/70 rounded-lg p-4 transition-colors hover:bg-gray-800">
              <div className="mr-4 bg-gray-700 rounded-full p-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-light-green"
                >
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                </svg>
              </div>
              <div>
                <p className="text-gray-400 text-sm mb-1">Phone Number</p>
                <Link
                  href="tel:+18883271022"
                  className="text-xl text-white font-medium hover:text-light-green transition-colors"
                >
                  (888) 327-1022
                </Link>
              </div>
            </div>
          </div>

          {/* Location Section */}
          <div className="flex flex-col">
            <h2 className="text-2xl font-medium mb-4 text-white">Location</h2>
            <div className="flex items-center bg-gray-800/70 rounded-lg p-4 transition-colors hover:bg-gray-800">
              <div className="mr-4 bg-gray-700 rounded-full p-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-light-green"
                >
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
              </div>
              <div>
                <p className="text-gray-400 text-sm mb-1">Mailing Address</p>
                <p className="text-xl text-white font-medium">
                  P.O. Box 78733, Los Angeles, CA 90016
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
