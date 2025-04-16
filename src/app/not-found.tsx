import { Metadata } from "next"
import RedirectClient from "../components/redirect-client"

export const metadata: Metadata = {
  title: "Page Not Found | The Blunt Heads",
  description: "Redirecting you to the home page",
}

export default function NotFound() {
  return (
    <div className="flex flex-col gap-4 items-center justify-center min-h-[calc(100vh-64px)] bg-black text-white">
      <div className="w-16 h-16 border-4 border-t-dark-green border-r-dark-green border-b-transparent border-l-transparent rounded-full animate-spin mb-4"></div>
      <h1 className="text-2xl font-bold">Redirecting...</h1>
      <p className="text-gray-300">
        Taking you to The Blunt Heads home page
      </p>
      <RedirectClient />
    </div>
  )
}
