"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { useAuth } from "@/context/auth-context"
import {
  ArrowRight,
  ChevronRight,
  Globe,
  MapPin,
  MessageSquare,
  Phone,
  Search,
  Shield,
  Star,
  Target,
  Trophy,
  Zap,
  User,
  LogOut,
  Brain,
  BarChart3,
  Sparkles,
  Bot,
  Cpu,
  Menu,
  X,
  MoonStar,
  Sun,
  CheckCircle2,
  Clock,
} from "lucide-react"

export default function Home() {
  const { user, logout } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const [scrollY, setScrollY] = useState(0)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isDarkMode, setIsDarkMode] = useState(false)
  const heroRef = useRef<HTMLDivElement>(null)
  const aiSectionRef = useRef<HTMLDivElement>(null)

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)

  useEffect(() => {
    setIsLoaded(true)

    const handleScroll = () => {
      setScrollY(window.scrollY)
    }

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }

    // Check for dark mode preference
    if (typeof window !== "undefined") {
      const darkModePreference = localStorage.getItem("darkMode") === "true"
      setIsDarkMode(darkModePreference)
      if (darkModePreference) {
        document.documentElement.classList.add("dark")
      }
    }

    window.addEventListener("scroll", handleScroll)
    window.addEventListener("mousemove", handleMouseMove)

    return () => {
      window.removeEventListener("scroll", handleScroll)
      window.removeEventListener("mousemove", handleMouseMove)
    }
  }, [])

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode)
    if (typeof window !== "undefined") {
      if (isDarkMode) {
        document.documentElement.classList.remove("dark")
        localStorage.setItem("darkMode", "false")
      } else {
        document.documentElement.classList.add("dark")
        localStorage.setItem("darkMode", "true")
      }
    }
  }

  const parallaxOffset = (depth: number) => {
    return {
      transform: `translate(${mousePosition.x / (100 * depth)}px, ${mousePosition.y / (100 * depth)}px)`,
    }
  }

  const scrollToAI = () => {
    if (aiSectionRef.current) {
      aiSectionRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <header className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-md sticky top-0 z-10 shadow-sm transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="flex-shrink-0 flex items-center group">
                <span className="text-2xl font-bold text-[#00A1DE] transition-all duration-300 hover:text-[#0090c5]">
                  Igire
                </span>
                <span className="text-2xl font-bold text-[#009A44] ml-1 transition-all duration-300 hover:text-[#008a3d]">
                  Hub
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              <Link
                href="#how-it-works"
                className="text-gray-700 dark:text-gray-300 hover:text-[#00A1DE] transition-colors duration-300 relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-[#00A1DE] after:transition-all hover:after:w-full"
              >
                How It Works
              </Link>
              <Link
                href="#features"
                className="text-gray-700 dark:text-gray-300 hover:text-[#00A1DE] transition-colors duration-300 relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-[#00A1DE] after:transition-all hover:after:w-full"
              >
                Features
              </Link>
              <Link
                href="#ai-powered"
                onClick={scrollToAI}
                className="text-gray-700 dark:text-gray-300 hover:text-[#00A1DE] transition-colors duration-300 relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-[#00A1DE] after:transition-all hover:after:w-full"
              >
                AI-Powered
              </Link>
              <Link
                href="#about"
                className="text-gray-700 dark:text-gray-300 hover:text-[#00A1DE] transition-colors duration-300 relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-[#00A1DE] after:transition-all hover:after:w-full"
              >
                About Us
              </Link>
              <Link
                href="#testimonials"
                className="text-gray-700 dark:text-gray-300 hover:text-[#00A1DE] transition-colors duration-300 relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-[#00A1DE] after:transition-all hover:after:w-full"
              >
                Testimonials
              </Link>

              {user && (
                <>
                  <Link
                    href="/submit"
                    className="text-gray-700 dark:text-gray-300 hover:text-[#00A1DE] transition-colors duration-300 relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-[#00A1DE] after:transition-all hover:after:w-full"
                  >
                    Submit
                  </Link>
                  <Link
                    href="/track"
                    className="text-gray-700 dark:text-gray-300 hover:text-[#00A1DE] transition-colors duration-300 relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-[#00A1DE] after:transition-all hover:after:w-full"
                  >
                    Track
                  </Link>
                </>
              )}

              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-300"
                aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
              >
                {isDarkMode ? <Sun className="h-5 w-5" /> : <MoonStar className="h-5 w-5" />}
              </button>
            </nav>

            <div className="flex items-center space-x-4">
              {/* Mobile menu button */}
              <button
                onClick={toggleMenu}
                className="md:hidden p-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Toggle menu"
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>

              {user ? (
                <div className="relative group">
                  <button className="flex items-center space-x-2 focus:outline-none bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded-md transition-colors duration-300 hover:bg-gray-200 dark:hover:bg-gray-700">
                    <span className="text-gray-700 dark:text-gray-300">{user.name || "Profile"}</span>
                    <User className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-20 hidden group-hover:block border border-gray-200 dark:border-gray-700">
                    <div className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700">
                      Signed in as <span className="font-medium">{user.name || `ID:${user.id}`}</span>
                    </div>
                    <Link
                      href="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      Your Profile
                    </Link>
                    <button
                      onClick={() => {
                        logout()
                        setIsMenuOpen(false)
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </button>
                  </div>
                </div>
              ) : (
                <Link
                  href="/auth/login"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#00A1DE] hover:bg-[#0090c5] transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
                >
                  Login
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white dark:bg-gray-900 shadow-lg border-t border-gray-200 dark:border-gray-800">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link
                href="#how-it-works"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                onClick={() => setIsMenuOpen(false)}
              >
                How It Works
              </Link>
              <Link
                href="#features"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                onClick={() => setIsMenuOpen(false)}
              >
                Features
              </Link>
              <Link
                href="#ai-powered"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                onClick={() => {
                  setIsMenuOpen(false)
                  scrollToAI()
                }}
              >
                AI-Powered
              </Link>
              <Link
                href="#about"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                onClick={() => setIsMenuOpen(false)}
              >
                About Us
              </Link>
              <Link
                href="#testimonials"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                onClick={() => setIsMenuOpen(false)}
              >
                Testimonials
              </Link>
              {user && (
                <>
                  <Link
                    href="/submit"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Submit
                  </Link>
                  <Link
                    href="/track"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Track
                  </Link>
                </>
              )}
              <div className="flex items-center justify-between px-3 py-2">
                <span className="text-gray-700 dark:text-gray-300">Dark Mode</span>
                <button
                  onClick={toggleDarkMode}
                  className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                >
                  {isDarkMode ? <Sun className="h-5 w-5" /> : <MoonStar className="h-5 w-5" />}
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      <main className="flex-grow">
        {/* Hero Section */}
        <section ref={heroRef} className="relative overflow-hidden min-h-[80vh] flex items-center">
          {/* Animated Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#00A1DE]/20 to-[#009A44]/20 z-0 overflow-hidden">
            {/* Animated circles */}
            <div
              className={`absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-[#00A1DE]/10 transition-all duration-1000 ease-in-out ${isLoaded ? "opacity-100" : "opacity-0 translate-y-10"}`}
              style={{ ...parallaxOffset(3), animationDelay: "0.2s" }}
            ></div>
            <div
              className={`absolute bottom-1/3 right-1/4 w-96 h-96 rounded-full bg-[#009A44]/10 transition-all duration-1000 ease-in-out ${isLoaded ? "opacity-100" : "opacity-0 translate-y-10"}`}
              style={{ ...parallaxOffset(2), animationDelay: "0.4s" }}
            ></div>
            <div
              className={`absolute top-2/3 left-1/3 w-48 h-48 rounded-full bg-[#00A1DE]/15 transition-all duration-1000 ease-in-out ${isLoaded ? "opacity-100" : "opacity-0 translate-y-10"}`}
              style={{ ...parallaxOffset(4), animationDelay: "0.6s" }}
            ></div>

            {/* Kigali skyline silhouette */}
            <div
              className="absolute bottom-0 left-0 right-0 h-48 bg-[url('/placeholder.svg?height=400&width=1200')] bg-bottom bg-no-repeat opacity-20"
              style={{ transform: `translateY(${scrollY * 0.1}px)` }}
            ></div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 relative z-1">
            <div className="text-center max-w-3xl mx-auto">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-[#00A1DE]/10 text-[#00A1DE] mb-6 animate-fadeIn">
                <Cpu className="h-5 w-5 mr-2" />
                <span className="text-sm font-medium">AI-Powered Citizen Services</span>
              </div>
              <h1
                className={`text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-gray-900 dark:text-white transition-all duration-1000 ease-out ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-10"}`}
              >
                Transform Public Services with{" "}
                <span className="text-[#00A1DE] inline-block hover:scale-105 transition-transform duration-300">
                  Igire
                </span>{" "}
                <span className="text-[#009A44] inline-block hover:scale-105 transition-transform duration-300">
                  Citizen Hub
                </span>
              </h1>
              <p
                className={`text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-10 transition-all duration-1000 ease-out ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
                style={{ transitionDelay: "200ms" }}
              >
                A smarter way to submit, track, and resolve complaints in Rwanda—via web, SMS, or USSD.
              </p>
              <div
                className={`flex flex-col sm:flex-row justify-center gap-4 transition-all duration-1000 ease-out ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
                style={{ transitionDelay: "400ms" }}
              >
                <Link
                  href="#ai-powered"
                  onClick={scrollToAI}
                  className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-[#009A44] hover:bg-[#008a3d] transition-all duration-300 hover:shadow-lg hover:-translate-y-1 group"
                >
                  Explore AI Features
                  <ChevronRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
          </div>

          {/* Animated wave */}
          <div className="absolute bottom-0 left-0 right-0 h-16 overflow-hidden">
            <svg className="absolute bottom-0 w-full h-24" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
              <path
                fill="#f3f4f6"
                fillOpacity="1"
                d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,224C672,245,768,267,864,261.3C960,256,1056,224,1152,197.3C1248,171,1344,149,1392,138.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
                className="animate-wave"
              ></path>
            </svg>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-16 bg-gray-50 dark:bg-gray-800 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">How It Works</h2>
              <p className="mt-4 text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Three simple steps to make your voice heard and improve public services
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Step 1 */}
              <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-6 relative transform transition-all duration-500 hover:scale-105 hover:shadow-xl">
                <div className="absolute -top-4 -left-4 w-10 h-10 rounded-full bg-[#00A1DE] text-white flex items-center justify-center font-bold text-lg">
                  1
                </div>
                <div className="flex justify-center mb-6">
                  <div className="w-16 h-16 rounded-full bg-[#00A1DE]/10 flex items-center justify-center group">
                    <MessageSquare className="w-8 h-8 text-[#00A1DE] transition-transform duration-300 group-hover:scale-110" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-3 text-center text-gray-900 dark:text-white">Submit</h3>
                <p className="text-gray-600 dark:text-gray-300 text-center">
                  Describe your issue via web, SMS (*677#), or voice call in Kinyarwanda or English.
                </p>
              </div>

              {/* Step 2 */}
              <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-6 relative transform transition-all duration-500 hover:scale-105 hover:shadow-xl">
                <div className="absolute -top-4 -left-4 w-10 h-10 rounded-full bg-[#00A1DE] text-white flex items-center justify-center font-bold text-lg">
                  2
                </div>
                <div className="flex justify-center mb-6">
                  <div className="w-16 h-16 rounded-full bg-[#00A1DE]/10 flex items-center justify-center group">
                    <Search className="w-8 h-8 text-[#00A1DE] transition-transform duration-300 group-hover:scale-110" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-3 text-center text-gray-900 dark:text-white">Track</h3>
                <p className="text-gray-600 dark:text-gray-300 text-center">
                  Get real-time updates via SMS or online. See your complaint on a live map.
                </p>
              </div>

              {/* Step 3 */}
              <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-6 relative transform transition-all duration-500 hover:scale-105 hover:shadow-xl">
                <div className="absolute -top-4 -left-4 w-10 h-10 rounded-full bg-[#00A1DE] text-white flex items-center justify-center font-bold text-lg">
                  3
                </div>
                <div className="flex justify-center mb-6">
                  <div className="w-16 h-16 rounded-full bg-[#00A1DE]/10 flex items-center justify-center group">
                    <Target className="w-8 h-8 text-[#00A1DE] transition-transform duration-300 group-hover:scale-110" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-3 text-center text-gray-900 dark:text-white">Resolve</h3>
                <p className="text-gray-600 dark:text-gray-300 text-center">
                  Agencies address issues fast. Earn points for airtime or discounts!
                </p>
              </div>
            </div>
          </div>

          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#00A1DE]/5 rounded-bl-full"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#009A44]/5 rounded-tr-full"></div>
        </section>

        {/* AI-Powered Section */}
        <section
          id="ai-powered"
          ref={aiSectionRef}
          className="py-20 bg-white dark:bg-gray-900 relative overflow-hidden"
        >
          <div className="absolute inset-0 opacity-5 pointer-events-none">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage:
                  "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%2300A1DE' fillOpacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
              }}
            ></div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-16">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-[#00A1DE]/10 text-[#00A1DE] mb-4">
                <Brain className="h-5 w-5 mr-2" />
                <span className="text-sm font-medium">Artificial Intelligence</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
                Powered by Advanced AI
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Our platform leverages cutting-edge artificial intelligence to analyze, categorize, and route complaints
                with unprecedented accuracy.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className="order-2 md:order-1">
                <div className="space-y-8">
                  <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg border border-gray-100 dark:border-gray-700 transform transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                    <div className="flex items-start">
                      <div className="bg-[#00A1DE]/10 p-3 rounded-full mr-4">
                        <Bot className="h-6 w-6 text-[#00A1DE]" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                          Natural Language Processing
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300">
                          Our AI understands complaints in both Kinyarwanda and English, extracting key information
                          regardless of how they're phrased.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg border border-gray-100 dark:border-gray-700 transform transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                    <div className="flex items-start">
                      <div className="bg-[#009A44]/10 p-3 rounded-full mr-4">
                        <BarChart3 className="h-6 w-6 text-[#009A44]" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                          Predictive Analytics
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300">
                          Identify patterns and predict service issues before they become widespread, enabling proactive
                          maintenance.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg border border-gray-100 dark:border-gray-700 transform transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                    <div className="flex items-start">
                      <div className="bg-[#00A1DE]/10 p-3 rounded-full mr-4">
                        <Zap className="h-6 w-6 text-[#00A1DE]" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                          Intelligent Routing
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300">
                          Complaints are automatically categorized and routed to the appropriate agency with 90%
                          accuracy, reducing response times.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="order-1 md:order-2 relative">
                <div className="relative rounded-lg overflow-hidden shadow-xl">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#00A1DE]/80 to-[#009A44]/80 mix-blend-multiply"></div>
                  <img
                    src="/ai.jpeg"
                    alt="AI Analysis Dashboard"
                    className="w-full h-auto"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-white text-center p-6">
                      <Sparkles className="h-12 w-12 mx-auto mb-4" />
                      <h3 className="text-2xl font-bold mb-2">AI-Powered Analysis</h3>
                      <p className="text-white/90 max-w-md">
                        Our AI processes thousands of complaints daily, learning and improving with each interaction.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Floating stats */}
                <div className="absolute -top-6 -right-6 bg-white dark:bg-gray-900 rounded-lg shadow-lg p-4 animate-float">
                  <div className="flex items-center">
                    <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-full mr-3">
                      <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Accuracy Rate</p>
                      <p className="text-xl font-bold text-gray-900 dark:text-white">90%</p>
                    </div>
                  </div>
                </div>

                <div className="absolute -bottom-6 -left-6 bg-white dark:bg-gray-900 rounded-lg shadow-lg p-4 animate-float animation-delay-1000">
                  <div className="flex items-center">
                    <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full mr-3">
                      <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Response Time</p>
                      <p className="text-xl font-bold text-gray-900 dark:text-white">-40%</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-16 text-center">
              <Link
                href="/ai-features"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-[#00A1DE] hover:bg-[#0090c5] transition-all duration-300 hover:shadow-lg hover:-translate-y-1 group"
              >
                Learn More About Our AI
                <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </section>

        {/* Key Features Section */}
        <section id="features" className="py-16 bg-gray-50 dark:bg-gray-800 relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">Key Features</h2>
              <p className="mt-4 text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Innovative solutions to connect citizens with government services
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* Feature 1 */}
              <div className="bg-white dark:bg-gray-900 rounded-lg p-6 shadow-md transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
                <div className="flex justify-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-[#00A1DE]/10 flex items-center justify-center group">
                    <Zap className="w-6 h-6 text-[#00A1DE] transition-transform duration-300 group-hover:scale-110" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold mb-2 text-center text-gray-900 dark:text-white">
                  AI-Powered Routing
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-center text-sm">
                  Complaints auto-assigned to agencies with 90% accuracy.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="bg-white dark:bg-gray-900 rounded-lg p-6 shadow-md transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
                <div className="flex justify-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-[#009A44]/10 flex items-center justify-center group">
                    <Phone className="w-6 h-6 text-[#009A44] transition-transform duration-300 group-hover:scale-110" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold mb-2 text-center text-gray-900 dark:text-white">Offline Access</h3>
                <p className="text-gray-600 dark:text-gray-300 text-center text-sm">
                  USSD/SMS works without internet—perfect for rural areas.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="bg-white dark:bg-gray-900 rounded-lg p-6 shadow-md transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
                <div className="flex justify-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-[#00A1DE]/10 flex items-center justify-center group">
                    <Shield className="w-6 h-6 text-[#00A1DE] transition-transform duration-300 group-hover:scale-110" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold mb-2 text-center text-gray-900 dark:text-white">Transparency</h3>
                <p className="text-gray-600 dark:text-gray-300 text-center text-sm">
                  Public dashboard tracks agency performance.
                </p>
              </div>

              {/* Feature 4 */}
              <div className="bg-white dark:bg-gray-900 rounded-lg p-6 shadow-md transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
                <div className="flex justify-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-[#009A44]/10 flex items-center justify-center group">
                    <Trophy className="w-6 h-6 text-[#009A44] transition-transform duration-300 group-hover:scale-110" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold mb-2 text-center text-gray-900 dark:text-white">Gamification</h3>
                <p className="text-gray-600 dark:text-gray-300 text-center text-sm">
                  Earn Igire Points for rewards like MTN airtime.
                </p>
              </div>
            </div>
          </div>

          {/* Background decorative elements */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-[#00A1DE]/5 rounded-full"></div>
            <div className="absolute top-1/4 right-0 w-60 h-60 bg-[#009A44]/5 rounded-full"></div>
            <div className="absolute bottom-0 left-1/3 w-40 h-40 bg-[#00A1DE]/5 rounded-full"></div>
          </div>
        </section>

        {/* About Us Section */}
        <section id="about" className="py-16 bg-white dark:bg-gray-900 relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="max-w-3xl mx-auto text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                Aligned with Rwanda's Vision 2050
              </h2>
              <p className="mt-6 text-lg text-gray-600 dark:text-gray-300">
                Igire Citizen Hub bridges the gap between citizens and public services, leveraging geolocation and
                lightweight AI to boost accountability.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-8 mt-10">
              <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg shadow-md flex items-center justify-center transform transition-all duration-300 hover:scale-105 hover:shadow-lg">
                <div className="text-center">
                  <div className="w-32 h-16 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center mb-2">
                    <span className="font-bold text-gray-700 dark:text-gray-300">RISA</span>
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Rwanda Information Society Authority</span>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg shadow-md flex items-center justify-center transform transition-all duration-300 hover:scale-105 hover:shadow-lg">
                <div className="text-center">
                  <div className="w-32 h-16 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center mb-2">
                    <span className="font-bold text-gray-700 dark:text-gray-300">ICT Chamber</span>
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">ICT Chamber Rwanda</span>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg shadow-md flex items-center justify-center transform transition-all duration-300 hover:scale-105 hover:shadow-lg">
                <div className="text-center">
                  <div className="w-32 h-16 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center mb-2">
                    <span className="font-bold text-gray-700 dark:text-gray-300">MTN Rwanda</span>
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Telecommunications Partner</span>
                </div>
              </div>
            </div>
          </div>

          {/* Background pattern */}
          <div className="absolute inset-0 opacity-5 pointer-events-none">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage:
                  "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%2300A1DE' fillOpacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
              }}
            ></div>
          </div>
        </section>

        {/* USSD Demo Section */}
        <section className="py-16 bg-gray-50 dark:bg-gray-800 relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="flex flex-col lg:flex-row items-center gap-12">
              <div className="lg:w-1/2">
                <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Access Anywhere with USSD</h2>
                <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
                  No smartphone? No internet? No problem! Access Igire Citizen Hub services from any mobile phone by
                  dialing:
                </p>
                <div className="bg-white dark:bg-gray-900 p-6 rounded-lg text-center mb-6 transform transition-all duration-500 hover:scale-105 hover:shadow-lg">
                  <span className="text-3xl font-mono font-bold text-[#00A1DE]">*677#</span>
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Submit complaints, track status, and redeem rewards—all from your basic phone in Kinyarwanda or
                  English.
                </p>
                <div className="flex justify-center lg:justify-start">
                  <Link
                    href="/ussd-guide"
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-[#009A44] hover:bg-[#008a3d] transition-all duration-300 hover:shadow-lg hover:-translate-y-1 group"
                  >
                    USSD Guide{" "}
                    <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>
              <div className="lg:w-1/2 flex justify-center">
                <div className="relative transform transition-all duration-500 hover:scale-105">
                  <div className="bg-black rounded-3xl p-4 w-64 shadow-xl">
                    <div className="bg-gray-800 rounded-2xl p-4 h-96 text-white">
                      <div className="text-center mb-6 text-green-400 font-mono text-lg animate-pulse">*677#</div>
                      <div className="space-y-4 font-mono text-sm">
                        <p className="text-center text-gray-400">IGIRE CITIZEN HUB</p>
                        <p>1. Submit complaint</p>
                        <p>2. Track complaint</p>
                        <p>3. View points</p>
                        <p>4. Redeem rewards</p>
                        <p>5. Change language</p>
                        <p className="text-gray-400 mt-6">Reply with option:</p>
                        <div className="border-b border-gray-700 w-full"></div>
                        <div className="text-right text-green-400 animate-blink">1</div>
                      </div>
                    </div>
                  </div>
                  <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Background decorative elements */}
          <div className="absolute top-0 right-0 w-full h-full overflow-hidden pointer-events-none">
            <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-gradient-to-bl from-[#00A1DE]/10 to-transparent rounded-bl-full"></div>
            <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-gradient-to-tr from-[#009A44]/10 to-transparent rounded-tr-full"></div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="py-16 bg-white dark:bg-gray-900 relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">What People Are Saying</h2>
              <p className="mt-4 text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Real stories from citizens and government officials using Igire Citizen Hub
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Testimonial 1 */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg shadow-md p-6 transform transition-all duration-500 hover:scale-105 hover:shadow-xl">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-[#00A1DE]/20 flex items-center justify-center mr-4">
                    <span className="text-[#00A1DE] font-bold">A</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">Alice</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Kigali</p>
                  </div>
                </div>
                <p className="text-gray-600 dark:text-gray-300 italic">
                  "Submitted a pothole complaint via SMS—fixed in 2 days! I was amazed at how quickly the city
                  responded."
                </p>
                <div className="flex mt-4">
                  <Star className="w-5 h-5 text-yellow-400" />
                  <Star className="w-5 h-5 text-yellow-400" />
                  <Star className="w-5 h-5 text-yellow-400" />
                  <Star className="w-5 h-5 text-yellow-400" />
                  <Star className="w-5 h-5 text-yellow-400" />
                </div>
              </div>

              {/* Testimonial 2 */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg shadow-md p-6 transform transition-all duration-500 hover:scale-105 hover:shadow-xl">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-[#009A44]/20 flex items-center justify-center mr-4">
                    <span className="text-[#009A44] font-bold">J</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">Jean</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Musanze</p>
                  </div>
                </div>
                <p className="text-gray-600 dark:text-gray-300 italic">
                  "I used the USSD service to report a water outage in my village. I received updates by SMS and the
                  issue was resolved within a week."
                </p>
                <div className="flex mt-4">
                  <Star className="w-5 h-5 text-yellow-400" />
                  <Star className="w-5 h-5 text-yellow-400" />
                  <Star className="w-5 h-5 text-yellow-400" />
                  <Star className="w-5 h-5 text-yellow-400" />
                  <Star className="w-5 h-5 text-gray-300 dark:text-gray-600" />
                </div>
              </div>

              {/* Testimonial 3 */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg shadow-md p-6 transform transition-all duration-500 hover:scale-105 hover:shadow-xl">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-[#00A1DE]/20 flex items-center justify-center mr-4">
                    <span className="text-[#00A1DE] font-bold">G</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">Government Official</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">City of Kigali</p>
                  </div>
                </div>
                <p className="text-gray-600 dark:text-gray-300 italic">
                  "Resolution times dropped 40% with Igire. The platform has transformed how we respond to citizen
                  complaints and improved our service delivery."
                </p>
                <div className="flex mt-4">
                  <Star className="w-5 h-5 text-yellow-400" />
                  <Star className="w-5 h-5 text-yellow-400" />
                  <Star className="w-5 h-5 text-yellow-400" />
                  <Star className="w-5 h-5 text-yellow-400" />
                  <Star className="w-5 h-5 text-yellow-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Background pattern */}
          <div className="absolute inset-0 opacity-5 pointer-events-none">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage:
                  "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23009A44' fillOpacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
              }}
            ></div>
          </div>
        </section>

        
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <span className="text-2xl font-bold text-[#00A1DE]">Igire</span>
                <span className="text-2xl font-bold text-[#009A44] ml-1">Hub</span>
              </div>
              <p className="text-gray-400 text-sm">Bridging the gap between citizens and public services in Rwanda.</p>
              <div className="mt-4 flex items-center">
                <Brain className="h-5 w-5 text-[#00A1DE] mr-2" />
                <span className="text-sm text-gray-300">Powered by AI</span>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#how-it-works" className="text-gray-400 hover:text-white transition-colors duration-300">
                    How It Works
                  </Link>
                </li>
                <li>
                  <Link href="#features" className="text-gray-400 hover:text-white transition-colors duration-300">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="#about" className="text-gray-400 hover:text-white transition-colors duration-300">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="#testimonials" className="text-gray-400 hover:text-white transition-colors duration-300">
                    Testimonials
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Resources</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/ussd-guide" className="text-gray-400 hover:text-white transition-colors duration-300">
                    USSD Guide
                  </Link>
                </li>
                <li>
                  <Link href="/faq" className="text-gray-400 hover:text-white transition-colors duration-300">
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="text-gray-400 hover:text-white transition-colors duration-300">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="text-gray-400 hover:text-white transition-colors duration-300">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact</h3>
              <ul className="space-y-2">
                <li className="flex items-center text-gray-400 group">
                  <MapPin className="w-4 h-4 mr-2 group-hover:text-[#00A1DE] transition-colors duration-300" />
                  <span className="group-hover:text-white transition-colors duration-300">Kigali, Rwanda</span>
                </li>
                <li className="flex items-center text-gray-400 group">
                  <Phone className="w-4 h-4 mr-2 group-hover:text-[#00A1DE] transition-colors duration-300" />
                  <span className="group-hover:text-white transition-colors duration-300">+250 788 123 456</span>
                </li>
                <li className="flex items-center text-gray-400 group">
                  <MessageSquare className="w-4 h-4 mr-2 group-hover:text-[#00A1DE] transition-colors duration-300" />
                  <span className="group-hover:text-white transition-colors duration-300">info@igirehub.rw</span>
                </li>
                <li className="flex items-center text-gray-400 group">
                  <Globe className="w-4 h-4 mr-2 group-hover:text-[#00A1DE] transition-colors duration-300" />
                  <span className="group-hover:text-white transition-colors duration-300">www.igirehub.rw</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">© 2025 Igire Citizen Hub. Proudly made for Rwanda.</p>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <Link
                href="https://twitter.com"
                className="text-gray-400 hover:text-white transition-colors duration-300 transform hover:scale-110"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </Link>
              <Link
                href="https://linkedin.com"
                className="text-gray-400 hover:text-white transition-colors duration-300 transform hover:scale-110"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fillRule="evenodd"
                    d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                    clipRule="evenodd"
                  />
                </svg>
              </Link>
            </div>
          </div>
        </div>

        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23ffffff' fillOpacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
            }}
          ></div>
        </div>
      </footer>
    </div>
  )
}
