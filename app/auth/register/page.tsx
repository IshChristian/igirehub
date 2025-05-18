"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { Eye, EyeOff, Loader2, ChevronRight, AlertCircle, User, Mail, Phone, Lock, CheckSquare } from "lucide-react"

export default function RegisterPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const [focusedField, setFocusedField] = useState<string | null>(null)
  const { register } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Add animation on load
    setIsLoaded(true)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Validate at least one of email or phone is provided
    if (!email && !phone) {
      setError("Please provide either email or phone number")
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters")
      return
    }

    setIsLoading(true)

    try {
      await register({ name, email, phone, password })
      router.push("/auth/login?success=" + encodeURIComponent("Account created successfully! Please sign in."))
    } catch (error: any) {
      setError(error.message || "Registration failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
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
                <User className="h-8 w-8 text-[#00A1DE]" />
              </div>
            </div>
          </div>
          <h1 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            Create your <span className="text-[#00A1DE]">Igire</span> <span className="text-[#009A44]">Hub</span>{" "}
            account
          </h1>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Join our platform to submit and track public service complaints
          </p>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg flex items-center animate-fadeIn">
            <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="rounded-md shadow-sm space-y-4">
            {/* Full Name Field */}
            <div className="relative">
              <label htmlFor="name" className="sr-only">
                Full Name
              </label>
              <div
                className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors ${
                  focusedField === "name" ? "text-[#00A1DE]" : "text-gray-400"
                }`}
              >
                <User className="h-5 w-5" />
              </div>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onFocus={() => setFocusedField("name")}
                onBlur={() => setFocusedField(null)}
                className={`appearance-none relative block w-full px-3 py-3 pl-10 border ${
                  focusedField === "name"
                    ? "border-[#00A1DE] ring-1 ring-[#00A1DE]"
                    : "border-gray-300 dark:border-gray-700"
                } placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-[#00A1DE] focus:border-[#00A1DE] focus:z-10 sm:text-sm bg-white dark:bg-gray-800 transition-all duration-200`}
                placeholder="Full Name"
                required
              />
            </div>

            {/* Email Field */}
            <div className="relative">
              <label htmlFor="email" className="sr-only">
                Email (optional)
              </label>
              <div
                className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors ${
                  focusedField === "email" ? "text-[#00A1DE]" : "text-gray-400"
                }`}
              >
                <Mail className="h-5 w-5" />
              </div>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setFocusedField("email")}
                onBlur={() => setFocusedField(null)}
                className={`appearance-none relative block w-full px-3 py-3 pl-10 border ${
                  focusedField === "email"
                    ? "border-[#00A1DE] ring-1 ring-[#00A1DE]"
                    : "border-gray-300 dark:border-gray-700"
                } placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-[#00A1DE] focus:border-[#00A1DE] focus:z-10 sm:text-sm bg-white dark:bg-gray-800 transition-all duration-200`}
                placeholder="Email (optional if phone provided)"
              />
            </div>

            {/* Phone Field */}
            <div className="relative">
              <label htmlFor="phone" className="sr-only">
                Phone Number (optional)
              </label>
              <div
                className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors ${
                  focusedField === "phone" ? "text-[#00A1DE]" : "text-gray-400"
                }`}
              >
                <Phone className="h-5 w-5" />
              </div>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                onFocus={() => setFocusedField("phone")}
                onBlur={() => setFocusedField(null)}
                className={`appearance-none relative block w-full px-3 py-3 pl-10 border ${
                  focusedField === "phone"
                    ? "border-[#00A1DE] ring-1 ring-[#00A1DE]"
                    : "border-gray-300 dark:border-gray-700"
                } placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-[#00A1DE] focus:border-[#00A1DE] focus:z-10 sm:text-sm bg-white dark:bg-gray-800 transition-all duration-200`}
                placeholder="+250123456789 (optional if email provided)"
                pattern="\+[0-9]{10,15}"
              />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 -mt-2 ml-2">
              Format: +250123456789 (include country code)
            </p>

            {/* Password Field */}
            <div className="relative">
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <div
                className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors ${
                  focusedField === "password" ? "text-[#00A1DE]" : "text-gray-400"
                }`}
              >
                <Lock className="h-5 w-5" />
              </div>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setFocusedField("password")}
                onBlur={() => setFocusedField(null)}
                className={`appearance-none relative block w-full px-3 py-3 pl-10 pr-10 border ${
                  focusedField === "password"
                    ? "border-[#00A1DE] ring-1 ring-[#00A1DE]"
                    : "border-gray-300 dark:border-gray-700"
                } placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-[#00A1DE] focus:border-[#00A1DE] focus:z-10 sm:text-sm bg-white dark:bg-gray-800 transition-all duration-200`}
                placeholder="Password (min. 8 characters)"
                required
                minLength={8}
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

            {/* Confirm Password Field */}
            <div className="relative">
              <label htmlFor="confirm-password" className="sr-only">
                Confirm Password
              </label>
              <div
                className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors ${
                  focusedField === "confirmPassword" ? "text-[#00A1DE]" : "text-gray-400"
                }`}
              >
                <Lock className="h-5 w-5" />
              </div>
              <input
                id="confirm-password"
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onFocus={() => setFocusedField("confirmPassword")}
                onBlur={() => setFocusedField(null)}
                className={`appearance-none relative block w-full px-3 py-3 pl-10 border ${
                  focusedField === "confirmPassword"
                    ? "border-[#00A1DE] ring-1 ring-[#00A1DE]"
                    : "border-gray-300 dark:border-gray-700"
                } placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-[#00A1DE] focus:border-[#00A1DE] focus:z-10 sm:text-sm bg-white dark:bg-gray-800 transition-all duration-200`}
                placeholder="Confirm Password"
                required
                minLength={8}
              />
            </div>
          </div>

          {/* Terms and Conditions Checkbox */}
          <div className="flex items-center">
            <div className="flex items-center h-5">
              <input
                id="terms"
                type="checkbox"
                required
                className="h-4 w-4 text-[#00A1DE] focus:ring-[#00A1DE] border-gray-300 dark:border-gray-700 rounded transition-colors"
              />
            </div>
            <div className="ml-2 text-sm">
              <label htmlFor="terms" className="text-gray-700 dark:text-gray-300">
                I agree to the{" "}
                <Link href="/terms" className="font-medium text-[#00A1DE] hover:text-[#0090c5] transition-colors">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="font-medium text-[#00A1DE] hover:text-[#0090c5] transition-colors">
                  Privacy Policy
                </Link>
              </label>
            </div>
          </div>

          {/* Submit Button */}
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
                  Create Account
                  <span className="absolute right-3 inset-y-0 flex items-center pl-3">
                    <ChevronRight className="h-5 w-5 text-white group-hover:translate-x-1 transition-transform" />
                  </span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Sign In Link */}
        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{" "}
            <Link href="/auth/login" className="font-medium text-[#00A1DE] hover:text-[#0090c5] transition-colors">
              Sign in
            </Link>
          </p>
        </div>

        {/* Security Note */}
        <div className="mt-6 text-center">
          <div className="flex items-center justify-center text-xs text-gray-500 dark:text-gray-400">
            <CheckSquare className="h-4 w-4 mr-1 text-[#009A44]" />
            <span>Your information is securely encrypted</span>
          </div>
        </div>
      </div>

      {/* Add animation keyframes */}
      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  )
}
