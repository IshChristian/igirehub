"use client"

import { useState } from "react"
import Link from "next/link"
import { useAuth } from "@/context/auth-context"
import { Menu, X, User, Sun, Moon, Globe } from "lucide-react"
import { usePathname } from "next/navigation"

export default function Navbar() {
  const { user, logout } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [language, setLanguage] = useState<"EN" | "RW">("EN")
  const pathname = usePathname()

  const toggleMenu = () => setIsOpen(!isOpen)

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode)
    if (isDarkMode) {
      document.documentElement.classList.remove("dark")
    } else {
      document.documentElement.classList.add("dark")
    }
  }

  const toggleLanguage = () => {
    setLanguage(language === "EN" ? "RW" : "EN")
  }

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white dark:bg-gray-800 shadow-md z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <span className="text-2xl font-bold text-rwanda-blue">Igire</span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <Link href="/" className={`tab ${pathname === "/" ? "tab-active" : ""}`}>
              Home
            </Link>
            <Link href="/submit" className={`tab ${pathname === "/submit" ? "tab-active" : ""}`}>
              Submit
            </Link>
            <Link href="/track" className={`tab ${pathname === "/track" ? "tab-active" : ""}`}>
              Track
            </Link>
            {user?.role === "admin" || user?.role === "institution" && (
              <>
                <Link href="/admin" className={`tab ${pathname === "/admin" ? "tab-active" : ""}`}>
                  Dashboard
                </Link>
                <Link href="/analytics" className={`tab ${pathname === "/analytics" ? "tab-active" : ""}`}>
                  Analytics
                </Link>
              </>
            )}
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <button onClick={toggleLanguage} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
              <Globe className="h-5 w-5" />
              <span className="ml-1 text-sm font-medium">{language}</span>
            </button>

            <button onClick={toggleDarkMode} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            {user ? (
              <div className="relative group">
                <button className="flex items-center space-x-1 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                  <User className="h-5 w-5" />
                  <span className="text-sm font-medium">{user.points} pts</span>
                </button>
                <div className="absolute right-0 w-48 mt-2 py-2 bg-white dark:bg-gray-800 rounded-md shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
                  <div className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200">{user.name}</div>
                  <div className="border-t border-gray-200 dark:border-gray-700"></div>
                  <button
                    onClick={logout}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Sign out
                  </button>
                </div>
              </div>
            ) : (
              <Link href="/auth/login" className="btn btn-primary">
                Sign in
              </Link>
            )}
          </div>

          <div className="flex md:hidden items-center">
            {user && (
              <div className="mr-2 flex items-center">
                <User className="h-5 w-5" />
                <span className="ml-1 text-sm font-medium">{user.points} pts</span>
              </div>
            )}
            <button
              onClick={toggleMenu}
              className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link
              href="/"
              className="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={toggleMenu}
            >
              Home
            </Link>
            <Link
              href="/submit"
              className="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={toggleMenu}
            >
              Submit
            </Link>
            <Link
              href="/track"
              className="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={toggleMenu}
            >
              Track
            </Link>
            {user?.role === "admin" && (
              <>
                <Link
                  href="/admin"
                  className="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={toggleMenu}
                >
                  Dashboard
                </Link>
                <Link
                  href="/analytics"
                  className="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={toggleMenu}
                >
                  Analytics
                </Link>
              </>
            )}
          </div>
          <div className="pt-4 pb-3 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between px-5">
              <button onClick={toggleLanguage} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                <Globe className="h-5 w-5" />
                <span className="ml-1 text-sm font-medium">{language}</span>
              </button>

              <button onClick={toggleDarkMode} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
            </div>
            {!user ? (
              <div className="mt-3 px-2 space-y-1">
                <Link
                  href="/auth/login"
                  className="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={toggleMenu}
                >
                  Sign in
                </Link>
              </div>
            ) : (
              <div className="mt-3 px-2 space-y-1">
                <div className="px-3 py-2 text-base font-medium">{user.name}</div>
                <button
                  onClick={() => {
                    logout()
                    toggleMenu()
                  }}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
