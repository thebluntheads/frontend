import { Metadata } from "next"

import ProfilePhone from "@modules/account//components/profile-phone"
import ProfileBillingAddress from "@modules/account/components/profile-billing-address"
import ProfileEmail from "@modules/account/components/profile-email"
import ProfileName from "@modules/account/components/profile-name"
import ProfilePassword from "@modules/account/components/profile-password"

import { notFound } from "next/navigation"
import { listRegions } from "@lib/data/regions"
import { retrieveCustomer } from "@lib/data/customer"

export const metadata: Metadata = {
  title: "Profile",
  description: "View and edit your Medusa Store profile.",
}

export default async function Profile() {
  const customer = await retrieveCustomer()
  const regions = await listRegions()

  if (!customer || !regions) {
    notFound()
  }

  return (
    <div className="w-full" data-testid="profile-page-wrapper">
      <div className="mb-8 flex flex-col gap-y-4">
        <div className="flex items-center gap-4 mb-2">
          <div className="bg-dark-green/20 p-3 rounded-full">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-light-green"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white">Your Profile</h1>
        </div>
        <p className="text-white/70">
          View and update your profile information, including your name, email,
          and phone number. You can also update your billing address.
        </p>
      </div>
      <div className="flex flex-col gap-y-6 w-full">
        <div className="bg-black/30 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden">
          <ProfileName customer={customer} />
          <Divider />
          <ProfileEmail customer={customer} />
          <Divider />
          <ProfilePhone customer={customer} />
        </div>

        <div className="bg-black/30 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden mt-6">
          <ProfileBillingAddress customer={customer} regions={regions} />
        </div>
      </div>
    </div>
  )
}

const Divider = () => {
  return <div className="w-full h-px bg-white/10" />
}
;``
