"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"

const characters = [
  {
    id: "black-cake",
    name: "Black Cake",
    image: "/assets/black-cake.png",
    script: "What did I tell you to do? I'm not going to say it\nAgain. Now, go back in the house and put on\nSomething decent. Stop looking like a 1959 Tramp"
  },
  {
    id: "gelato",
    name: "Gelato",
    image: "/assets/gelato.png",
    script: "Hey Kush, let's catch the bus down to the hood\nTo see hang up with the homies. I was thinking\nBout getting another tattoo."
  },
  {
    id: "thai-stick",
    name: "Thai Stick",
    image: "/assets/thai-stick.png",
    script: "I Know you. You want Chinese fried rice wit\nExtra chicken and shrimp. That would be\n$17.93. No EBT card, only cash or credit card."
  },
  {
    id: "skittle-wrap",
    name: "Skittle Wrap",
    image: "/assets/skittle-rap.png",
    script: "H E Y-G I R L! What are you doing this Saturday, nothing!?\nWell, have plans to go to the WEHO Pride Parade around one\no' clock. I can pick you up or I can meet you there."
  }
]

export default function AuditionForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    character: "",
    instagram: "",
    tiktok: "",
    videoLink: ""
  })
  const [formError, setFormError] = useState("")
  const [formSubmitted, setFormSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleCharacterSelect = (characterId: string) => {
    setFormData(prev => ({ ...prev, character: characterId }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError("")
    setIsSubmitting(true)

    // Validate required fields
    if (!formData.name || !formData.email || !formData.character || !formData.videoLink) {
      setFormError("Please fill in all required fields")
      setIsSubmitting(false)
      return
    }

    try {
      const response = await fetch('/api/audition/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        setFormSubmitted(true)
        // Reset form
        setFormData({
          name: "",
          email: "",
          instagram: "",
          tiktok: "",
          character: "",
          videoLink: ""
        })
      } else {
        setFormError(data.message || "Something went wrong")
      }
    } catch (error) {
      setFormError("Failed to submit form. Please try again.")
      console.error("Form submission error:", error)
    }

    setIsSubmitting(false)
  }

  if (formSubmitted) {
    return (
      <div className="bg-dark-green/20 border border-light-green rounded-lg p-8 text-center">
        <div className="text-light-green text-5xl mb-4">🎭</div>
        <h2 className="text-white text-2xl font-bold mb-4">Thank You for Your Audition!</h2>
        <p className="text-white/80 mb-6">
          Thanks {formData.name}! Your audition has been submitted successfully. Our casting team will review your application and contact you soon.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link href="/" className="inline-block bg-light-green text-black font-medium px-6 py-3 rounded-lg hover:bg-light-green/90 transition-all">
            Return to Homepage
          </Link>
          <button
            onClick={() => setFormSubmitted(false)}
            className="bg-dark-green hover:bg-light-green text-white font-medium py-3 px-6 rounded-lg transition-colors"
          >
            Submit Another Audition
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-900/30 rounded-xl border border-gray-800 p-8 md:p-12">
      <h2 className="text-2xl font-bold text-white mb-6">📝 Audition Form</h2>
      
      {formError && (
        <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4 mb-6">
          <p className="text-red-400">{formError}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-white mb-2">
              Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-light-green focus:outline-none"
              placeholder="Enter your name"
              required
            />
          </div>
          
          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-white mb-2">
              Email <span className="text-red-400">*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-dark-green"
              required
            />
          </div>
        </div>
        

        

        

        
        {/* Social Media */}
        <div className="mb-8">
          <h3 className="text-white text-lg mb-4">Social Media Handles</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="instagram" className="block text-white mb-2">
                Instagram
              </label>
              <div className="flex">
                <span className="inline-flex items-center px-3 py-3 rounded-l-lg border border-r-0 border-gray-700 bg-gray-800 text-gray-400">
                  @
                </span>
                <input
                  type="text"
                  id="instagram"
                  name="instagram"
                  value={formData.instagram}
                  onChange={handleChange}
                  className="w-full bg-gray-800/50 border border-gray-700 rounded-r-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-dark-green"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="tiktok" className="block text-white mb-2">
                TikTok
              </label>
              <div className="flex">
                <span className="inline-flex items-center px-3 py-3 rounded-l-lg border border-r-0 border-gray-700 bg-gray-800 text-gray-400">
                  @
                </span>
                <input
                  type="text"
                  id="tiktok"
                  name="tiktok"
                  value={formData.tiktok}
                  onChange={handleChange}
                  className="w-full bg-gray-800/50 border border-gray-700 rounded-r-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-dark-green"
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* Character Selection */}
        <div className="mb-8">
          <h3 className="text-white text-lg mb-4">
            Which Character Are You Auditioning For? <span className="text-red-400">*</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {characters.map((character) => (
              <div
                key={character.id}
                className={`relative border-2 rounded-lg p-5 cursor-pointer transition-all ${
                  formData.character === character.id
                    ? "border-light-green bg-dark-green/20"
                    : "border-gray-700 bg-gray-800/30 hover:border-gray-500 hover:bg-gray-800/50"
                }`}
                onClick={() => handleCharacterSelect(character.id)}
              >
                <div className="flex items-center mb-3">
                  <div className="relative w-16 h-16 mr-3 overflow-hidden rounded-lg bg-black/20">
                    <Image
                      src={character.image}
                      alt={character.name}
                      fill
                      className="object-contain"
                    />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-white font-medium text-lg">{character.name}</h4>
                  </div>
                  
                  {formData.character === character.id && (
                    <div className="ml-auto bg-light-green rounded-full p-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </div>
                
                {/* Character Script */}
                <div className="mb-4 p-3 bg-gray-900/50 rounded border border-gray-700 text-white/80 text-sm whitespace-pre-line">
                  <p className="font-medium text-light-green mb-1">Audition Script:</p>
                  {character.script}
                </div>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCharacterSelect(character.id);
                  }}
                  className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${formData.character === character.id
                    ? "bg-light-green text-black"
                    : "bg-gray-700 text-white hover:bg-gray-600"
                  }`}
                >
                  {formData.character === character.id ? "Selected" : "Select"}
                </button>
              </div>
            ))}
          </div>
        </div>
        
        {/* Video Link */}
        <div className="mb-8">
          <label htmlFor="videoLink" className="block text-white mb-2">
            Paste your video link here: <span className="text-red-400">*</span>
          </label>
          <input
            type="url"
            id="videoLink"
            name="videoLink"
            value={formData.videoLink}
            onChange={handleChange}
            placeholder="https://youtube.com/... or https://vimeo.com/..."
            className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-dark-green"
            required
          />
        </div>
        
        {/* Audition Instructions */}
        <div className="mb-8 bg-gray-800/30 rounded-lg p-6 border border-gray-700">
          <h3 className="text-white text-lg font-medium mb-4">Audition Instructions</h3>
          <ol className="list-decimal pl-5 text-white/80 space-y-2">
            <li>Record up to 30 seconds of your voice performing the character's script (feel free to add flair and improv if you feel it).</li>
            <li>Upload your video to YouTube or Vimeo (set it to unlisted if you want it private).</li>
            <li>Paste the video link below so we can check it out.</li>
          </ol>
        </div>
        
        {/* Character Scripts */}
        <div className="mb-8">
          <h3 className="text-white text-lg font-medium mb-4">Character Scripts</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {characters.map((character) => (
              <div key={character.id} className="bg-gray-800/30 rounded-lg p-5 border border-gray-700">
                <div className="flex items-center mb-3">
                  <div className="relative w-10 h-10 mr-3 overflow-hidden rounded-lg">
                    <Image
                      src={character.image}
                      alt={character.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <h4 className="text-white font-medium">{character.name}</h4>
                </div>
                <p className="text-white/80 whitespace-pre-line">{character.script}</p>
              </div>
            ))}
          </div>
        </div>
        
        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-dark-green hover:bg-light-green text-white font-medium py-4 px-6 rounded-lg transition-colors"
        >
          Submit Audition
        </button>
      </form>
    </div>
  )
}
