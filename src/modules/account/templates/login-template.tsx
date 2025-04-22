"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"

import Register from "@modules/account/components/register"
import Login from "@modules/account/components/login"
import ForgotPassword from "@modules/account/components/forgot-password"

export enum LOGIN_VIEW {
  SIGN_IN = "sign-in",
  REGISTER = "register",
  FORGOT_PASSWORD = "forgot-password",
}

const LoginTemplate = () => {
  const [currentView, setCurrentView] = useState(LOGIN_VIEW.REGISTER)
  const searchParams = useSearchParams()
  
  // Check for token and email parameters to show password reset form
  const [hasResetParams, setHasResetParams] = useState(false)
  
  useEffect(() => {
    const token = searchParams.get("token")
    const email = searchParams.get("email")
    
    if (token && email) {
      setCurrentView(LOGIN_VIEW.FORGOT_PASSWORD)
      setHasResetParams(true)
    }
  }, [searchParams])

  return (
    <div className="w-full max-w-4xl mx-auto min-h-[80vh] flex flex-col justify-center items-center p-4 md:p-8">
      <div className="w-full bg-gray-900/30 rounded-xl border border-gray-800 overflow-hidden">
        {/* Tabs - Hide when showing password reset form with token/email params */}
        {!hasResetParams && (
          <div className="flex w-full">
            <button
              onClick={() => setCurrentView(LOGIN_VIEW.REGISTER)}
              className={`w-1/2 py-4 text-center font-medium text-lg transition-colors ${currentView === LOGIN_VIEW.REGISTER ? "bg-dark-green text-white" : "bg-gray-800/50 text-gray-400 hover:text-white"}`}
            >
              Register
            </button>
            <button
              onClick={() => setCurrentView(LOGIN_VIEW.SIGN_IN)}
              className={`w-1/2 py-4 text-center font-medium text-lg transition-colors ${currentView === LOGIN_VIEW.SIGN_IN ? "bg-dark-green text-white" : "bg-gray-800/50 text-gray-400 hover:text-white"}`}
            >
              Sign In
            </button>
          </div>
        )}
        
        {/* Content */}
        <div className="p-6 md:p-8">
          {currentView === LOGIN_VIEW.SIGN_IN && (
            <Login setCurrentView={setCurrentView} />
          )}
          {currentView === LOGIN_VIEW.REGISTER && (
            <Register setCurrentView={setCurrentView} />
          )}
          {currentView === LOGIN_VIEW.FORGOT_PASSWORD && (
            <ForgotPassword setCurrentView={setCurrentView} />
          )}
        </div>
      </div>
    </div>
  )
}

export default LoginTemplate
