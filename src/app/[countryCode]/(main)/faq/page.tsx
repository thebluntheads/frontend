"use client"

import React, { useState } from "react"
import { Disclosure } from "@headlessui/react"
import { ChevronDown } from "lucide-react"
import { Heading, Text } from "@medusajs/ui"

// FAQ data structure
const faqData = {
  "General Questions": [
    {
      question: "What is The Blunt Heads app?",
      answer:
        "The Blunt Heads is a unique and entertaining app featuring a series of animated episodes that combine humor, relatable storytelling, and a cannabis-friendly vibe.",
    },
    {
      question: "What type of content does the app offer?",
      answer:
        "The app provides exclusive access to episodes of The Blunt Heads, including teasers, behind-the-scenes content, and fun extras.",
    },
    {
      question: "Is the app suitable for all audiences?",
      answer:
        "The app is intended for mature audiences who enjoy comedy and cannabis culture.",
    },
    {
      question: "Where can I download the app?",
      answer:
        "The app is available for download on the App Store for iOS and the Google Play Store for Android.",
    },
  ],
  "Episodes and Content": [
    {
      question: "What is the ICE T teaser?",
      answer:
        "The ICE T teaser introduces fans to an exciting new element in The Blunt Heads universe, hinting at upcoming adventures.",
    },
    {
      question: "What are the episode titles for Season 1?",
      answer: (
        <div className="space-y-2">
          <p>Episode 1: The President Visits Fig</p>
          <p>Episode 2: Girl Chat</p>
          <p>Episode 3: Date Night</p>
          <p>Episode 4: The Barbershop</p>
          <p>Episode 5: 420 Bluntsgiving</p>
          <p>Episode 6: Baby Don't Leave Me</p>
          <p>Episode 7: What's Up, My Swisher</p>
          <p>Episode 8: Kesha the Super Model</p>
          <p>Episode 9: Game Night</p>
          <p>Episode 10: Baby Roach Gets Bullied</p>
          <p>Episode 11: Sativa Has a Problem</p>
          <p>Episode 12: Hi Grandma and Grandpa</p>
        </div>
      ),
    },
    {
      question: "Are new episodes released regularly?",
      answer:
        "Yes! The app frequently updates with new episodes, teasers, and special content.",
    },
    {
      question: "Can I binge-watch all episodes at once?",
      answer:
        "Episodes are released weekly, but once available, you can enjoy them on demand.",
    },
  ],
}

export default function FAQPage() {
  const [activeCategory, setActiveCategory] = useState<string>(
    Object.keys(faqData)[0]
  )

  return (
    <div className="bg-black min-h-screen py-16">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-4xl">
        <Heading
          level="h1"
          className="text-4xl md:text-5xl font-bold text-white text-center mb-12"
        >
          Frequently Asked Questions
        </Heading>

        {/* Category tabs */}
        <div className="flex flex-wrap justify-center gap-4 mb-10">
          {Object.keys(faqData).map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-6 py-3 rounded-full text-base font-medium transition-all duration-200 ${
                activeCategory === category
                  ? "bg-dark-green text-white"
                  : "bg-gray-800 text-gray-300 hover:bg-gray-700"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* FAQ accordions */}
        <div className="space-y-4">
          {faqData[activeCategory as keyof typeof faqData].map((faq, index) => (
            <Disclosure key={index}>
              {({ open }) => (
                <div
                  className={`bg-gray-800/50 backdrop-blur-sm rounded-lg overflow-hidden border border-gray-700/50 transition-all duration-200 ${
                    open ? "shadow-lg shadow-dark-green/10" : ""
                  }`}
                >
                  <Disclosure.Button className="flex justify-between items-center w-full px-6 py-5 text-left">
                    <Text className="text-lg font-medium text-white">
                      {faq.question}
                    </Text>
                    <ChevronDown
                      className={`w-5 h-5 text-light-green transition-transform duration-200 ${
                        open ? "transform rotate-180" : ""
                      }`}
                    />
                  </Disclosure.Button>
                  <Disclosure.Panel className="px-6 pb-5 pt-0">
                    <div className="text-gray-300 text-base leading-relaxed">
                      {faq.answer}
                    </div>
                  </Disclosure.Panel>
                </div>
              )}
            </Disclosure>
          ))}
        </div>

        {/* Contact section */}
        <div className="mt-16 text-center">
          <Heading level="h2" className="text-2xl font-bold text-white mb-4">
            Still have questions?
          </Heading>
          <Text className="text-gray-300 mb-6">
            If you couldn't find the answer to your question, feel free to
            contact our support team.
          </Text>
          <a
            href="mailto:support@thebluntheads.com"
            className="inline-block px-8 py-3 bg-dark-green hover:bg-light-green text-white font-medium rounded-full transition-colors duration-200"
          >
            Contact Support
          </a>
        </div>
      </div>
    </div>
  )
}
