"use client"

import React, { useActionState, useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import Input from "@modules/common/components/input"
import { generatePasswordToken, resetPassword } from "@lib/data/customer"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import ErrorMessage from "@modules/checkout/components/error-message"
import { LOGIN_VIEW } from "@modules/account/templates/login-template"

type Props = {
  setCurrentView: (view: LOGIN_VIEW) => void
}

const ForgotPassword = ({ setCurrentView }: Props) => {
  const [successState, setSuccessState] = useState(false)
  const searchParams = useSearchParams()
  const token = searchParams.get("token")
  const email = searchParams.get("email")

  const [message, generateFormAction] = useActionState(generatePasswordToken, {
    error: false,
    success: false,
  })

  const [state, formAction] = useActionState(resetPassword, {
    token,
    email,
  })

  const clearState = () => {
    setSuccessState(false)
  }

  useEffect(() => {
    setSuccessState(state?.success || false)
  }, [state])

  if (successState) {
    window.location.href = `/account`
  }

  if (!token || !email) {
    return (
      <div className="w-full flex flex-col items-center">
        <div className="w-full mb-8">
          <h1 className="text-3xl font-bold mb-4 text-white">Forgot Password</h1>
          <p className="text-gray-300 mb-6">
            Enter your email address and we'll send you a link to reset your password.
          </p>

          <form className="w-full flex flex-col" action={generateFormAction}>
            <div className="flex flex-col w-full gap-y-4">
              <Input
                label="Email"
                name="email"
                type="email"
                title="Enter a valid email address."
                autoComplete="email"
                required
                data-testid="email-input"
              />
            </div>
            {message.success && (
              <div className="mt-4 p-3 bg-dark-green/20 border border-dark-green rounded-lg text-green-300 text-sm">
                If an account exists with this email, a password reset link will be sent.
              </div>
            )}
            {message.error && (
              <div className="mt-4 p-3 bg-red-900/20 border border-red-700 rounded-lg text-red-300 text-sm">
                {message.error}
              </div>
            )}
            <SubmitButton
              data-testid="send-reset-button"
              className="w-full mt-6 bg-dark-green hover:bg-light-green text-white transition-colors py-3 rounded-lg"
            >
              Send Reset Link
            </SubmitButton>
          </form>
          <div className="flex flex-col items-center mt-6">
            <span className="text-center text-gray-300 mt-4">
              Remember your password?{" "}
              <button
                onClick={() => setCurrentView(LOGIN_VIEW.SIGN_IN)}
                className="text-light-green hover:underline"
              >
                Sign in
              </button>
            </span>
            <span className="text-center text-gray-300 mt-4">
              Not a member?{" "}
              <button
                onClick={() => setCurrentView(LOGIN_VIEW.REGISTER)}
                className="text-light-green hover:underline"
                data-testid="register-button"
              >
                Join us
              </button>
            </span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full flex flex-col items-center">
      <div className="w-full mb-8">
        <h1 className="text-3xl font-bold mb-4 text-white">Reset Your Password</h1>
        <p className="text-gray-300 mb-6">Enter your new password below.</p>
        <form className="w-full" action={formAction} onReset={clearState}>
          <div className="flex flex-col w-full gap-y-4">
            <Input
              label="New password"
              type="password"
              name="new_password"
              required
              data-testid="new-password-input"
            />
            <Input
              label="Confirm password"
              type="password"
              name="confirm_password"
              required
              data-testid="confirm-password-input"
            />
          </div>
          {successState && (
            <div className="mt-4 p-3 bg-dark-green/20 border border-dark-green rounded-lg text-green-300 text-sm">
              Password successfully reset! Redirecting to login...
            </div>
          )}
          <ErrorMessage
            error={state?.error}
            data-testid="reset-password-error-message"
          />
          <SubmitButton
            data-testid="reset-password-button"
            className="w-full mt-6 bg-dark-green hover:bg-light-green text-white transition-colors py-3 rounded-lg"
          >
            Reset Password
          </SubmitButton>
        </form>
      </div>
    </div>
  )
}

export default ForgotPassword
