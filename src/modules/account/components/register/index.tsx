"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Input from "@modules/common/components/input"
import { LOGIN_VIEW } from "@modules/account/templates/login-template"
import ErrorMessage from "@modules/checkout/components/error-message"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { signup } from "@lib/data/customer"

type Props = {
  setCurrentView: (view: LOGIN_VIEW) => void
}

const Register = ({ setCurrentView }: Props) => {
  const router = useRouter()
  const [isRedirecting, setIsRedirecting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  
  // Custom action to handle form submission with redirect
  const handleSubmit = async (formData: FormData) => {
    const result = await signup(null, formData);
    
    // Check if registration was successful
    if (result && typeof result === "object" && "success" in result && result.success) {
      console.log("Registration successful, redirecting to:", result.redirectTo);
      setIsRedirecting(true)
      
      // Use window.location for a more forceful redirect
      if (typeof window !== "undefined" && result.redirectTo) {
        window.location.href = result.redirectTo as string;
      }
    } else if (typeof result === "string") {
      // Handle error message
      setErrorMessage(result)
    }
    
    return result;
  }

  // If redirecting, show a loading state
  if (isRedirecting) {
    return (
      <div className="w-full flex flex-col items-center justify-center py-12" data-testid="register-page">
        <div className="text-light-green text-xl">Registration successful! Redirecting...</div>
        <div className="mt-4 animate-pulse">Please wait...</div>
      </div>
    )
  }
  
  return (
    <div
      className="w-full flex flex-col items-center"
      data-testid="register-page"
    >
      <h1 className="text-large-semi uppercase mb-6">
        Sign Up For Full Access
      </h1>
      <p className="text-center text-base-regular text-white mb-4">
        Create your profile, and get full access to our series, exclusive drops
        and member-only shopping experience.
      </p>
      <form className="w-full flex flex-col" action={handleSubmit}>
        <div className="flex flex-col w-full gap-y-2">
          <Input
            label="First name"
            name="first_name"
            required
            autoComplete="given-name"
            data-testid="first-name-input"
          />
          <Input
            label="Last name"
            name="last_name"
            required
            autoComplete="family-name"
            data-testid="last-name-input"
          />
          <Input
            label="Email"
            name="email"
            required
            type="email"
            autoComplete="email"
            data-testid="email-input"
          />
          <Input
            label="Phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            data-testid="phone-input"
          />
          <Input
            label="Password"
            name="password"
            required
            type="password"
            autoComplete="new-password"
            data-testid="password-input"
          />
        </div>
        <ErrorMessage error={errorMessage} data-testid="register-error" />
        <span className="text-center text-white text-small-regular mt-6">
          By creating an account, you agree to TheBluntHead&apos;s{" "}
          <LocalizedClientLink
            href="/content/privacy-policy"
            className="underline"
          >
            Privacy Policy
          </LocalizedClientLink>{" "}
          and{" "}
          <LocalizedClientLink
            href="/content/terms-of-use"
            className="underline"
          >
            Terms of Use
          </LocalizedClientLink>
          .
        </span>
        <SubmitButton
          className="w-full mt-6  bg-dark-green text-white"
          data-testid="register-button"
        >
          Join
        </SubmitButton>
      </form>
      <div className="text-center text-dark-green text-medium-regular mt-6">
        <p>Create an account to access exclusive content and features.</p>
      </div>
    </div>
  )
}

export default Register
