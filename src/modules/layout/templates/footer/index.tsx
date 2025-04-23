import { Text } from "@medusajs/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import NewsletterForm from "./newsletter-form"

export default async function Footer() {
  return (
    <footer className="bg-transparent w-full text-white border-t border-white/5">
      <div className="px-8 md:px-12 flex flex-col w-full max-w-[1440px] mx-auto">
        <div className="flex flex-col gap-y-8 md:flex-row items-start justify-between py-16">
          {/* Logo and About Section */}
          <div className="max-w-xs">
            <LocalizedClientLink
              href="/"
              className="hover:opacity-80 transition-opacity"
            >
              <img
                src="/assets/logo.png"
                alt="Logo"
                className="h-10 object-contain"
              />
            </LocalizedClientLink>
            <p className="mt-4 text-white/60 text-sm">
              The Blunt Heads is a premium animated series created for cannabis
              culture lovers and comedy fans alike. Stream original episodes,
              vibe to the official soundtrack, and shop exclusive merch — all in
              one place.
            </p>
          </div>

          {/* Newsletter Signup */}
          <div className="max-w-sm">
            <h3 className="text-base font-medium text-white mb-4">
              SIGNUP FOR EMAILS
            </h3>
            <p className="text-white/60 text-sm mb-4">
              Sign up to get updates, exclusives and more
            </p>
            <NewsletterForm />
          </div>

          {/* Navigation Links */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8 md:gap-12">
            {/* Content Links */}
            <div className="flex flex-col gap-y-4">
              <h3 className="text-base font-medium text-white">Content</h3>
              <ul className="grid grid-cols-1 gap-3 text-white/70 text-sm">
                <li>
                  <LocalizedClientLink
                    className="hover:text-white transition-colors"
                    href="/seasons"
                  >
                    Seasons
                  </LocalizedClientLink>
                </li>
                <li>
                  <LocalizedClientLink
                    className="hover:text-white transition-colors"
                    href="/store"
                  >
                    Store
                  </LocalizedClientLink>
                </li>
                <li>
                  <LocalizedClientLink
                    className="hover:text-white transition-colors"
                    href="/sounds"
                  >
                    Music
                  </LocalizedClientLink>
                </li>
              </ul>
            </div>

            {/* Account Links */}
            <div className="flex flex-col gap-y-4">
              <h3 className="text-base font-medium text-white">Account</h3>
              <ul className="grid grid-cols-1 gap-3 text-white/70 text-sm">
                <li>
                  <LocalizedClientLink
                    className="hover:text-white transition-colors"
                    href="/account"
                  >
                    My Account
                  </LocalizedClientLink>
                </li>
                <li>
                  <LocalizedClientLink
                    className="hover:text-white transition-colors"
                    href="/account/orders"
                  >
                    My Orders
                  </LocalizedClientLink>
                </li>
                <li>
                  <LocalizedClientLink
                    className="hover:text-white transition-colors"
                    href="/account/profile"
                  >
                    Profile
                  </LocalizedClientLink>
                </li>
                <li>
                  <LocalizedClientLink
                    className="hover:text-white transition-colors"
                    href="/cart"
                  >
                    Cart
                  </LocalizedClientLink>
                </li>
              </ul>
            </div>

            {/* Support Links */}
            <div className="flex flex-col gap-y-4">
              <h3 className="text-base font-medium text-white">Support</h3>
              <ul className="grid grid-cols-1 gap-3 text-white/70 text-sm">
                <li>
                  <LocalizedClientLink
                    className="hover:text-white transition-colors"
                    href="/contact"
                  >
                    Contact Us
                  </LocalizedClientLink>
                </li>
                <li>
                  <LocalizedClientLink
                    className="hover:text-white transition-colors"
                    href="/faq"
                  >
                    FAQs
                  </LocalizedClientLink>
                </li>
                <li>
                  <LocalizedClientLink
                    className="hover:text-white transition-colors"
                    href="/privacy-policy"
                  >
                    Privacy Policy
                  </LocalizedClientLink>
                </li>
                <li>
                  <LocalizedClientLink
                    className="hover:text-white transition-colors"
                    href="/terms"
                  >
                    Terms & Conditions
                  </LocalizedClientLink>
                </li>
                <li>
                  <LocalizedClientLink
                    className="hover:text-white transition-colors"
                    href="/giveaway-rules"
                  >
                    Giveaway Rules
                  </LocalizedClientLink>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Copyright and Social Links */}
        <div className="flex flex-col md:flex-row items-center justify-between py-8 border-t border-white/5">
          <Text className="text-sm text-white/60">
            John Boy Entertainment, Inc.
          </Text>
        </div>
      </div>
    </footer>
  )
}
