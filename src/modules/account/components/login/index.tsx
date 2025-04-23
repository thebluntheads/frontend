"use client"

import { login } from "@lib/data/customer"
import { LOGIN_VIEW } from "@modules/account/templates/login-template"
import ErrorMessage from "@modules/checkout/components/error-message"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import Input from "@modules/common/components/input"
import { useState } from "react"
import { useRouter } from "next/navigation"

type Props = {
  setCurrentView: (view: LOGIN_VIEW) => void
}

const Login = ({ setCurrentView }: Props) => {
  const router = useRouter()
  const [isRedirecting, setIsRedirecting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  
  // Custom action to handle form submission with redirect
  const handleSubmit = async (formData: FormData) => {
    const result = await login(null, formData);
    
    // Check if login was successful
    if (result && typeof result === "object" && "success" in result && result.success) {
      console.log("Login successful, redirecting to:", result.redirectTo);
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
      <div className="w-full flex flex-col items-center justify-center py-12" data-testid="login-page">
        <div className="text-light-green text-xl">Login successful! Redirecting...</div>
        <div className="mt-4 animate-pulse">Please wait...</div>
      </div>
    )
  }
  
  return (
    <div className="w-full flex flex-col items-center" data-testid="login-page">
      <h1 className="text-large-semi uppercase mb-6">Welcome back</h1>
      <p className="text-center text-base-regular text-white mb-8">
        Sign in to unlock your account, view seasons, and stay lit with the
        latest drops.{" "}
      </p>
      <form className="w-full" action={handleSubmit}>
        <div className="flex flex-col w-full gap-y-2">
          <Input
            label="Email"
            name="email"
            type="email"
            title="Enter a valid email address."
            autoComplete="email"
            required
            data-testid="email-input"
          />
          <Input
            label="Password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            data-testid="password-input"
          />
        </div>
        <ErrorMessage error={errorMessage} data-testid="login-error-message" />
        <SubmitButton
          data-testid="sign-in-button"
          className="w-full mt-6 bg-dark-green hover:bg-light-green text-white transition-colors py-3 rounded-lg"
        >
          Sign in
        </SubmitButton>
      </form>
      <div className="text-center text-white text-small-regular mt-6">
        <p>Sign in with your email and password to access exclusive content.</p>
        <button
          onClick={() => setCurrentView(LOGIN_VIEW.FORGOT_PASSWORD)}
          className="text-light-green hover:underline mt-4 inline-block"
          data-testid="forgot-password-button"
        >
          Forgot your password?
        </button>
      </div>
    </div>
  )
}

export default Login
