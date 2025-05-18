"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import {
  Eye,
  EyeOff,
  Loader2,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  Phone,
  Mail,
  Lock,
  Github,
  Facebook,
  Twitter,
} from "lucide-react"

export default function LoginPage() {
  const [loginInput, setLoginInput] = useState("") // Can be email or phone
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isInputFocused, setIsInputFocused] = useState(false)
  const [isPasswordFocused, setIsPasswordFocused] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const { login, user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Add animation on load
    setIsLoaded(true)

    // Check for redirect params (e.g., after registration)
    const urlParams = new URLSearchParams(window.location.search)
    const successMsg = urlParams.get("success")
    if (successMsg) {
      setSuccess(decodeURIComponent(successMsg))
    }

    // If user is already logged in, redirect based on role
    if (user) {
      redirectBasedOnRole(user.role)
    }
  }, [user])

  const redirectBasedOnRole = (role: string) => {
    switch (role) {
      case "admin":
      case "institution":
        router.push("/admin")
        break
      case "user":
      default:
        router.push("/")
        break
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setIsLoading(true)

    try {
      // Call the actual login function with the user's credentials
      const loggedInUser = await login(loginInput, password)
      
      if (loggedInUser) {
        setSuccess("Login successful! Redirecting...")
        redirectBasedOnRole(loggedInUser.role)
      }
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message)
      } else {
        setError("Invalid login credentials. Please try again.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Helper to determine if input looks like an email
  const isEmail = (input: string) => {
    return input.includes("@") && input.includes(".")
  }

  // Helper to determine input type icon
  const getInputIcon = () => {
    if (!loginInput) return <Mail className="h-5 w-5 text-gray-400" />
    return isEmail(loginInput) ? (
      <Mail className="h-5 w-5 text-[#00A1DE]" />
    ) : (
      <Phone className="h-5 w-5 text-[#00A1DE]" />
    )
  }


  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
      <div
        className={`max-w-md w-full space-y-8 transition-all duration-700 ease-out transform ${
          isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        }`}
      >
        <div>
          <div className="flex justify-center">
            <div className="h-16 w-16 rounded-full bg-gradient-to-r from-[#00A1DE] to-[#009A44] p-1 flex items-center justify-center shadow-lg">
              <div className="h-full w-full rounded-full bg-white dark:bg-gray-900 flex items-center justify-center">
                <Lock className="h-8 w-8 text-[#00A1DE]" />
              </div>
            </div>
          </div>
          <h1 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            Sign in to <span className="text-[#00A1DE]">Igire</span> <span className="text-[#009A44]">Hub</span>
          </h1>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Access your account to submit and track complaints
          </p>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg flex items-center animate-fadeIn">
            <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 px-4 py-3 rounded-lg flex items-center animate-fadeIn">
            <CheckCircle className="h-5 w-5 mr-2 flex-shrink-0" />
            <p>{success}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="rounded-md shadow-sm space-y-4">
            <div className="relative">
              <label htmlFor="login" className="sr-only">
                Email or Phone Number
              </label>
              <div
                className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors ${
                  isInputFocused ? "text-[#00A1DE]" : "text-gray-400"
                }`}
              >
                {getInputIcon()}
              </div>
              <input
                id="login"
                name="login"
                type={isEmail(loginInput) ? "email" : "tel"}
                autoComplete="username"
                value={loginInput}
                onChange={(e) => setLoginInput(e.target.value)}
                onFocus={() => setIsInputFocused(true)}
                onBlur={() => setIsInputFocused(false)}
                required
                className={`appearance-none relative block w-full px-3 py-3 pl-10 border ${
                  isInputFocused ? "border-[#00A1DE] ring-1 ring-[#00A1DE]" : "border-gray-300 dark:border-gray-700"
                } placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-[#00A1DE] focus:border-[#00A1DE] focus:z-10 sm:text-sm bg-white dark:bg-gray-800 transition-all duration-200`}
                placeholder="Email or phone number"
              />
            </div>
            <div className="relative">
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <div
                className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors ${
                  isPasswordFocused ? "text-[#00A1DE]" : "text-gray-400"
                }`}
              >
                <Lock className="h-5 w-5" />
              </div>
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setIsPasswordFocused(true)}
                onBlur={() => setIsPasswordFocused(false)}
                required
                className={`appearance-none relative block w-full px-3 py-3 pl-10 pr-10 border ${
                  isPasswordFocused ? "border-[#00A1DE] ring-1 ring-[#00A1DE]" : "border-gray-300 dark:border-gray-700"
                } placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-[#00A1DE] focus:border-[#00A1DE] focus:z-10 sm:text-sm bg-white dark:bg-gray-800 transition-all duration-200`}
                placeholder="Password"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors" />
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-[#00A1DE] focus:ring-[#00A1DE] border-gray-300 dark:border-gray-700 rounded transition-colors"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <Link
                href="/auth/forgot-password"
                className="font-medium text-[#00A1DE] hover:text-[#0090c5] transition-colors"
              >
                Forgot password?
              </Link>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-[#00A1DE] to-[#009A44] hover:from-[#0090c5] hover:to-[#008a3d] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00A1DE] transition-all duration-300 hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  Sign in
                  <span className="absolute right-3 inset-y-0 flex items-center pl-3">
                    <ChevronRight className="h-5 w-5 text-white group-hover:translate-x-1 transition-transform" />
                  </span>
                </>
              )}
            </button>
          </div>
        </form>

        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Don&apos;t have an account?{" "}
            <Link href="/auth/register" className="font-medium text-[#00A1DE] hover:text-[#0090c5] transition-colors">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
