"use client"

import { useState } from "react"

import Register from "@modules/account/components/register"
import Login from "@modules/account/components/login"

export enum LOGIN_VIEW {
  SIGN_IN = "sign-in",
  REGISTER = "register",
}

const LoginTemplate = () => {
  const [currentView, setCurrentView] = useState("register")

  return (
    <div className="w-full max-w-4xl mx-auto min-h-[80vh] flex flex-col justify-center items-center p-4 md:p-8">
      <div className="w-full bg-gray-900/30 rounded-xl border border-gray-800 overflow-hidden">
        {/* Tabs */}
        <div className="flex w-full">
          <button
            onClick={() => setCurrentView("register")}
            className={`w-1/2 py-4 text-center font-medium text-lg transition-colors ${currentView === "register" ? "bg-dark-green text-white" : "bg-gray-800/50 text-gray-400 hover:text-white"}`}
          >
            Register
          </button>
          <button
            onClick={() => setCurrentView("sign-in")}
            className={`w-1/2 py-4 text-center font-medium text-lg transition-colors ${currentView === "sign-in" ? "bg-dark-green text-white" : "bg-gray-800/50 text-gray-400 hover:text-white"}`}
          >
            Sign In
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6 md:p-8">
          {currentView === "sign-in" ? (
            <Login setCurrentView={setCurrentView} />
          ) : (
            <Register setCurrentView={setCurrentView} />
          )}
        </div>
      </div>
    </div>
  )
}

export default LoginTemplate
