import { Metadata } from "next"
import Image from "next/image"
import AuditionForm from "@modules/audition/templates/audition-form"

export const metadata: Metadata = {
  title: "Voice Actor Casting Call | TheBluntHeads",
  description: "Audition for The Blunt Heads animated series. Show us your voice acting talent!",
}

export default function AuditionPage() {
  return (
    <div className="w-full max-w-6xl mx-auto py-16 px-4 md:px-8">
      <h1 className="text-4xl md:text-5xl font-bold text-center mb-4 text-white">
        🎬 NOW CASTING – The Blunt Heads
      </h1>
      
      <p className="text-xl text-center text-white/90 mb-8 max-w-3xl mx-auto">
        Think your voice has main character energy?<br />
        This is your chance to be part of a bold, hilarious, and unfiltered animated series straight outta LA.
      </p>
      
      <p className="text-lg text-center text-white/80 mb-12 max-w-3xl mx-auto">
        We're casting for 4 wild and unforgettable characters. Read the lines, record your vibe, and show us what you've got!
      </p>

      <div className="border-t border-white/10 w-full max-w-3xl mx-auto mb-12"></div>
      
      <AuditionForm />
    </div>
  )
}
