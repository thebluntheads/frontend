"use client"

import React from "react"
import { Heading, Text } from "@medusajs/ui"

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-black min-h-screen py-16">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-4xl">
        <Heading
          level="h1"
          className="text-4xl md:text-5xl font-bold text-white text-center mb-12"
        >
          Privacy Policy
        </Heading>

        <div className="prose prose-invert prose-lg max-w-none">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-8 border border-gray-700/50">
            <p className="mb-6">
              THIS CURRENT WEB SITE THAT YOU ARE ON, RESPECTS YOUR PRIVACY. IN
              ORDER TO KEEP YOU INFORMED ABOUT OUR LATEST PRODUCTS, SPECIALS, AND
              OTHER NEWS, WE MAY ASK FOR YOUR E-MAIL ADDRESS. MORE IMPORTANTLY,
              WE NEED THIS ADDRESS SHOULD WE NEED TO CONTACT YOU ABOUT ANY ORDER,
              DELAY, OR SHIPPING INFORMATION. TO FULFILL YOUR ORDER, WE NEED YOUR
              SHIPPING ADDRESS, PHONE NUMBER, AND CREDIT CARD INFORMATION. WE
              UNDERSTAND THAT WE ARE ASKING FOR SENSITIVE INFORMATION, AND YOU
              CAN REST ASSURED THAT WE MAKE EVERY EFFORT POSSIBLE TO ENSURE THE
              PRIVACY AND SECURITY OF YOUR TRANSACTIONS. YOUR CREDIT CARD NUMBER
              IS NOT FULLY VISIBLE TO US WHEN YOU PLACE AN ORDER AND OTHER
              PERSONAL DATA WILL BE TREATED WITH THE HIGHEST GROUNDS OF SECURITY
              AND CONFIDENTIALITY, WE NEVER SELL, RENT, OR GIVE AWAY YOUR NAME,
              EMAIL, OR ADDRESS TO ANYONE WITHOUT YOUR CONSENT.
            </p>

            <h2 className="text-2xl font-bold text-light-green mt-8 mb-4">
              SECURE SHOPPING
            </h2>
            <p className="mb-6">
              ORDERING FROM THIS WEB SITE IS SAFE AND SECURE. FROM THE MOMENT YOU
              ENTER OUR SHOPPING CART, YOU ARE ON A SECURE SERVER, USING WHAT IS
              CALLED SSL (SECURE SOCKET LAYER) TECHNOLOGY. YOUR CREDIT CARD AND
              PERSONAL INFORMATION IS ENCRYPTED WHEN TRANSMITTED TO US AND ARE
              STORED IN A SECURE ENVIRONMENT WITH STRIPE.
            </p>

            <p className="mb-6">
              SOMETIMES YOU MAY GET A MESSAGE THAT SOME PAGES ON THIS CURRENT WEB
              SITE THAT ARE NOT SECURE. THIS IS A SECURITY ALERT MESSAGE WHICH
              RESULTS FROM BROWSING TO A NON-SECURE PAGE FROM A SECURE PAGE. THIS
              CURRENT WEB SITE ONLY SECURES THE PAGES THAT CONTAIN YOUR PERSONAL
              INFORMATION INCLUDING CREDIT CARD NUMBER. THIS HELPS US KEEP THE
              SITE QUICK AND EFFICIENT. IF YOU ARE EVER CONCERNED ABOUT THE
              SECURITY OF A PAGE, SIMPLY LOOK AT THE URL. IF IT BEGINS WITH A
              "HTTPS://" INSTEAD OF "HTTP://" THE SITE IS SECURE. IF YOU HAVE ANY
              CONCERNS ABOUT PLACING YOUR ORDER ONLINE, PLEASE EMAIL US BY
              VISITING OUR CONTACT PAGE.
            </p>

            <p className="mb-6">
              PLEASE NOTE THAT EMAIL IS NOT ENCRYPTED AND IS THEREFORE NOT A
              SECURE MEANS OF TRANSMITTING CREDIT CARD INFORMATION. THIS CURRENT
              WEB SITE, WILL NEVER REQUEST SENSITIVE INFORMATION OVER E-MAIL.
            </p>

            <h2 className="text-2xl font-bold text-light-green mt-8 mb-4">
              REMARKETING
            </h2>
            <p className="mb-6">
              THIS CURRENT WEB SITE THAT YOU ARE ON, USES COOKIES TO IDENTIFY
              VISITORS SO THAT WE MAY SHOW ADS TO PEOPLE WHO HAVE VISITED OUR
              SITE ACROSS THE INTERNET. THIS IS DONE THROUGH COMPANIES THAT
              PROVIDE RETARGETING SERVICES INCLUDING GOOGLE AND ADROLL. YOU MAY
              OPT OUT OF GOOGLE'S USE OF COOKIES BY GOOGLE BY VISITING THE ADS
              PREFERENCES MANAGER.
            </p>

            <h2 className="text-2xl font-bold text-light-green mt-8 mb-4">
              EMAIL POLICY
            </h2>
            <p className="mb-6">
              THIS CURRENT WEB SITE, MAY SOMETIMES SEND PROMOTIONAL EMAILS PER
              WEEK TO KEEP OUR SUBSCRIBERS INFORMED ABOUT THE LATEST TRENDS AND
              SALES. IT IS POSSIBLE TO UNSUBSCRIBE AT ANY TIME BY SIMPLY CLICKING
              THE LINK AT THE BOTTOM OF AN EMAIL. HAVING TROUBLE? SEND AN EMAIL
              TO US BY VISITING OUR CONTACT PAGE WITH THE SUBJECT LINE
              "UNSUBSCRIBE". IF YOU ARE UNSUBSCRIBED, ANY EMAILS YOU RECEIVE FROM
              US WILL BE DIRECTLY RELATED TO YOUR ORDERS ONLY.
            </p>

            <h2 className="text-2xl font-bold text-light-green mt-8 mb-4">
              CONTACTING US
            </h2>
            <p className="mb-6">
              IT'S EASY TO CONTACT US BY SENDING AN EMAIL TO CUSTOMER SERVICE BY
              VISITING OUR CONTACT PAGE. OUR TEAM IS AVAILABLE TO ANSWER ANY
              CONCERNS.
            </p>
          </div>
        </div>

        <div className="mt-12 text-center">
          <Text className="text-gray-300">Last updated: April 16, 2025</Text>
        </div>
      </div>
    </div>
  )
}
